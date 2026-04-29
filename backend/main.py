from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.routes import scans, ocr
import uvicorn

app = FastAPI(title="OCR Backend API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scans.router, prefix="/api/history", tags=["History"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])

@app.get("/")
def read_root():
    return {"message": "OCR Backend API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
