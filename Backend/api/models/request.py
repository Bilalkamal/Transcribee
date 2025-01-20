# api/models/request.py
from pydantic import BaseModel, HttpUrl

class TranscriptionRequest(BaseModel):
    youtube_url: HttpUrl
