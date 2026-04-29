from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from core.firebase import db
from api.deps import get_current_user
from models.schemas import ScanResponse
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ScanResponse])
def get_user_scans(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    
    # Query without order_by to avoid requiring composite index
    # Sorting will be done in Python
    docs = db.collection("scans").where("user_id", "==", user_id).stream()
    
    scans = []
    for doc in docs:
        scan_data = doc.to_dict()
        scan_data["id"] = doc.id
        scans.append(ScanResponse(**scan_data))
    
    # Sort by created_at in descending order (most recent first)
    scans.sort(key=lambda x: x.created_at, reverse=True)
        
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific scan by ID"""
    user_id = current_user.get("uid")
    
    doc_ref = db.collection("scans").document(scan_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_data = doc.to_dict()
    
    # Verify ownership
    if scan_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this scan")
    
    scan_data["id"] = doc.id
    return ScanResponse(**scan_data)

@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    
    # Check if scan exists and belongs to user
    doc_ref = db.collection("scans").document(scan_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    if doc.to_dict().get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this scan")
        
    doc_ref.delete()
    return None
