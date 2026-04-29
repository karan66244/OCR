from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse
from api.deps import get_current_user
from services.ocr_service import perform_ocr
from services.export_service import export_to_docx, export_to_pdf, export_to_txt
from core.firebase import db
from models.schemas import ScanResponse, TextUpdateRequest
from datetime import datetime, timezone
from io import BytesIO

router = APIRouter()

@router.post("/scan", response_model=ScanResponse)
async def scan_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Scan an image document and extract text using high-accuracy OCR.
    Supports: PNG, JPG, JPEG, BMP, TIFF
    """
    # Validate file type
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/bmp", "image/tiff"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Only image files (PNG, JPG, JPEG, BMP, TIFF) are supported"
        )
        
    try:
        contents = await file.read()
        
        # Perform high-accuracy OCR
        extracted_text, confidence = perform_ocr(contents)
        
        # Save to Firestore
        user_id = current_user.get("uid")
        scan_data = {
            "user_id": user_id,
            "file_name": file.filename,
            "extracted_text": extracted_text,
            "edited_text": extracted_text,  # User can edit this
            "confidence_score": confidence,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add to Firestore
        doc_ref = db.collection("scans").document()
        doc_ref.set(scan_data)
        
        # Prepare response
        scan_data["id"] = doc_ref.id
        
        return ScanResponse(**scan_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@router.put("/scan/{scan_id}")
async def update_scan_text(
    scan_id: str,
    request: TextUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the extracted text for a scan (user edits).
    """
    try:
        doc_ref = db.collection("scans").document(scan_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        # Verify ownership
        if doc.get("user_id") != current_user.get("uid"):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update edited text
        doc_ref.update({
            "edited_text": request.edited_text,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"status": "success", "message": "Text updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/{scan_id}/{format}")
async def export_scan(
    scan_id: str,
    format: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Export scan result in different formats: pdf, docx, txt
    """
    # Validate format
    valid_formats = {"pdf", "docx", "txt"}
    if format.lower() not in valid_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid format. Supported formats: {', '.join(valid_formats)}"
        )
    
    try:
        # Get scan from Firestore
        doc_ref = db.collection("scans").document(scan_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        scan_data = doc.to_dict()
        
        # Verify ownership
        if scan_data.get("user_id") != current_user.get("uid"):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Use edited text if available, otherwise use original
        text = scan_data.get("edited_text") or scan_data.get("extracted_text", "")
        filename = scan_data.get("file_name", "document")
        
        # Generate export
        if format.lower() == "pdf":
            output = export_to_pdf(text, filename)
            media_type = "application/pdf"
            file_ext = "pdf"
        elif format.lower() == "docx":
            output = export_to_docx(text, filename)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            file_ext = "docx"
        else:  # txt
            output = export_to_txt(text)
            media_type = "text/plain"
            file_ext = "txt"
        
        # Create filename
        base_filename = filename.rsplit('.', 1)[0] if '.' in filename else filename
        export_filename = f"{base_filename}_extracted.{file_ext}"
        
        # Return as streaming response
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={export_filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
