# api/models/response.py
from pydantic import BaseModel
from typing import Optional, Dict, Any

class TranscriptionResponse(BaseModel):
    status: str
    job_id: Optional[str] = None
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    transcription_raw: Optional[str] = None
    transcription: Optional[Dict[str, Any]] = None

class JobStatusResponse(BaseModel):
    status: str
    job_id: Optional[str] = None
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    transcription_raw: Optional[str] = None
    transcription: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
