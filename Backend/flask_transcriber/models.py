# flask_transcriber/models.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class Job(BaseModel):
    job_id: str
    video_id: str
    status: str
    fail_count: Optional[int] = 0
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class Transcription(BaseModel):
    id: str = Field(..., alias='_id')  # Alias 'id' to '_id'
    video_title: str
    transcription: Dict[str, Any]  # Complete transcription data
    transcription_raw: str  # Raw transcription text
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
