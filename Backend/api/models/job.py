# api/models/job.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Job(BaseModel):
    job_id: str
    video_id: str
    status: str
    fail_count: Optional[int] = 0
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
