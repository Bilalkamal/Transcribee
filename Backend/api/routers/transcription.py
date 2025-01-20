# api/routers/transcription.py
from fastapi import APIRouter, HTTPException, Depends
from api.models.request import TranscriptionRequest
from api.models.response import TranscriptionResponse, JobStatusResponse
from api.db.mongodb import get_db
from api.utils.validation import validate_youtube_url, extract_video_id
from pymongo.collection import Collection
from datetime import datetime
import uuid
import redis
import json
from fastapi.responses import JSONResponse
import logging
from typing import Optional

router = APIRouter()

# Redis configuration
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0

# Initialize Redis client
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

@router.post("/", response_model=TranscriptionResponse, status_code=202)
async def create_transcription(request: TranscriptionRequest, db=Depends(get_db)):
    youtube_url = request.youtube_url

    # Convert Url object to string
    youtube_url_str = str(youtube_url)

    # Validate YouTube URL
    if not validate_youtube_url(youtube_url_str):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    # Extract video ID
    video_id = extract_video_id(youtube_url_str)
    if not video_id:
        raise HTTPException(status_code=400, detail="Could not extract video ID from the URL.")

    # Check if transcription already exists
    transcriptions_collection: Collection = db.transcriptions
    existing_transcription = transcriptions_collection.find_one({'_id': video_id})
    if existing_transcription:
        return TranscriptionResponse(
            status="completed",
            video_id=existing_transcription['_id'],
            video_title=existing_transcription['video_title'],
            transcription_raw=existing_transcription['transcription_raw'],
            transcription=existing_transcription['transcription']
        )

    # Generate a unique job ID
    job_id = str(uuid.uuid4())

    # Create a job record in MongoDB
    jobs_collection: Collection = db.jobs
    job = {
        'job_id': job_id,
        'video_id': video_id,
        'status': 'pending',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    try:
        jobs_collection.insert_one(job)
    except Exception as e:
        logging.error(f"Error inserting job into MongoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

    # Add the job to the Redis queue
    job_data = {
        'job_id': job_id,
        'video_id': video_id
    }
    try:
        redis_client.rpush('transcription_queue', json.dumps(job_data))
    except Exception as e:
        logging.error(f"Error adding job to Redis queue: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

    return TranscriptionResponse(status="accepted", job_id=job_id)

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str, db=Depends(get_db)):
    jobs_collection: Collection = db.jobs
    transcriptions_collection: Collection = db.transcriptions

    job = jobs_collection.find_one({'job_id': job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job['status'] == 'success':
        transcription = transcriptions_collection.find_one({'_id': job['video_id']})
        if transcription:
            return JobStatusResponse(
                status="success",
                video_id=transcription['_id'],
                video_title=transcription['video_title'],
                transcription_raw=transcription['transcription_raw'],
                transcription=transcription['transcription']
            )
        else:
            return JobStatusResponse(
                status="success",
                transcription=None
            )
    elif job['status'] == 'failed':
        return JobStatusResponse(
            status="failed",
            error=job.get('error', 'Unknown error')
        )
    else:
        return JobStatusResponse(
            status=job['status']
        )
