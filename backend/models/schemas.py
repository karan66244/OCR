from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ScanResult(BaseModel):
    id: Optional[str] = None
    user_id: str
    file_name: str
    extracted_text: str
    edited_text: Optional[str] = None
    confidence_score: float
    created_at: datetime
    
class ScanResponse(BaseModel):
    id: str
    file_name: str
    extracted_text: str
    edited_text: Optional[str] = None
    confidence_score: float
    created_at: datetime


class TextUpdateRequest(BaseModel):
    edited_text: str
