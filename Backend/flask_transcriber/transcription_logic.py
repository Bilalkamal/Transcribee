# flask_transcriber/transcription_logic.py
import os
import time
import shutil
import tempfile
from typing import Optional, Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq
from dotenv import load_dotenv
import subprocess
import logging
import random
import threading
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from flask_transcriber.models import Transcription
from flask_transcriber.utils import download_youtube_audio, chunk_audio_file
from pydantic import ValidationError

load_dotenv()

# Configuration
API_KEYS = os.getenv("API_KEYS", "")
API_KEYS = API_KEYS.split(',')
if not API_KEYS:
    raise ValueError("No API keys found. Please set API_KEYS in your environment variables.")

MAX_WORKERS = len(API_KEYS)
MAX_RETRIES = 3
INITIAL_BACKOFF = 2  # seconds

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "transcriptions")

# Initialize MongoDB client
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]
jobs_collection = db['jobs']
transcriptions_collection = db['transcriptions']

# Logging Configuration
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# API Key Manager
class APIKeyManager:
    """
    Manages API keys and tracks their usage to ensure fair rotation.
    """
    def __init__(self, api_keys: list):
        self.api_keys = api_keys
        self.usage_counts = {key: 0 for key in api_keys}
        self.lock = threading.Lock()

    def get_least_used_key(self) -> str:
        """
        Retrieves the least used API key in a thread-safe manner.
        """
        with self.lock:
            least_used_key = min(self.api_keys, key=lambda k: self.usage_counts[k])
            self.usage_counts[least_used_key] += 1
            return least_used_key

    def get_new_key(self, exclude_key: Optional[str] = None) -> Optional[str]:
        """
        Retrieves the least used API key, excluding the specified key.
        Returns None if no other key is available.
        """
        with self.lock:
            available_keys = [k for k in self.api_keys if k != exclude_key]
            if not available_keys:
                return None
            least_used_key = min(available_keys, key=lambda k: self.usage_counts[k])
            self.usage_counts[least_used_key] += 1
            return least_used_key

# Initialize APIKeyManager
api_key_manager = APIKeyManager(API_KEYS)

def transcribe_audio_chunk(chunk_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Transcribes a single audio chunk using the Groq SDK with retry logic.
    """
    chunk_path = chunk_info["chunk_path"]
    chunk_index = chunk_info["chunk_index"]
    api_key = chunk_info.get("api_key")
    client_groq = Groq(api_key=api_key)
    attempt = 0
    backoff = INITIAL_BACKOFF
    last_error = None

    while attempt < MAX_RETRIES:
        try:
            with open(chunk_path, "rb") as file:
                transcription = client_groq.audio.transcriptions.create(
                    file=file,
                    model="whisper-large-v3-turbo",
                    response_format="verbose_json",
                    temperature=0.0
                )
            transcription_data = transcription.model_dump()
            return {
                "chunk_index": chunk_index,
                "text": transcription_data.get("text", ""),
                "segments": transcription_data.get("segments", [])
            }
        except Exception as e:
            attempt += 1
            last_error = e
            error_code = getattr(e, 'status_code', None)
            
            # Log the specific error details
            logging.error(f"Chunk {chunk_index}: Transcription attempt {attempt} failed. Error: {e}, Status Code: {error_code}")
            
            # For server errors (5xx), immediately fail after one attempt
            if error_code and 500 <= error_code < 600:
                error_msg = f"Groq server error (HTTP {error_code}): {str(e)}"
                logging.error(error_msg)
                raise Exception(error_msg)
            
            if attempt < MAX_RETRIES:
                new_api_key = api_key_manager.get_new_key(exclude_key=api_key)
                if not new_api_key:
                    logging.error(f"Chunk {chunk_index}: No alternative API keys available for retry.")
                    break
                else:
                    api_key = new_api_key
                    client_groq = Groq(api_key=api_key)
                    time.sleep(backoff + random.uniform(0, 1))
                    backoff *= 2
            else:
                logging.error(f"Chunk {chunk_index}: All transcription attempts failed.")
                raise Exception(f"All transcription attempts failed for chunk {chunk_index}. Last error: {last_error}")

def rotate_api_keys(total_requests: int) -> List[str]:
    """
    Rotates API keys by selecting the least used key for each request.
    """
    assigned_keys = []
    for _ in range(total_requests):
        key = api_key_manager.get_least_used_key()
        assigned_keys.append(key)
    return assigned_keys

def merge_transcriptions(transcription_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Merges multiple transcription chunks into a single transcription.
    """
    merged_transcription = {
        "text": "",
        "segments": []
    }

    transcription_chunks_sorted = sorted(transcription_chunks, key=lambda x: x['chunk_index'])
    time_offset = 0
    for chunk in transcription_chunks_sorted:
        merged_transcription["text"] += chunk["text"] + " "
        for segment in chunk.get("segments", []):
            segment["start"] += time_offset
            segment["end"] += time_offset
            merged_transcription["segments"].append(segment)
        if chunk.get("segments"):
            time_offset = merged_transcription["segments"][-1]["end"]

    merged_transcription["text"] = merged_transcription["text"].strip()
    return merged_transcription

def process_transcription(video_id: str, job_id: str):
    overall_start_time = time.time()

    # Update job status to 'processing'
    jobs_collection.update_one(
        {'job_id': job_id},
        {'$set': {'status': 'processing', 'updated_at': datetime.utcnow()}}
    )

    # Create a temporary directory for audio files should be deleted after processing
    temp_dir = tempfile.mkdtemp(prefix="transcription_temp_")

    try:
        # Step 1: Download YouTube Audio
        download_result = download_youtube_audio(video_id, temp_dir)
        if not download_result:
            error_msg = "Failed to download audio from YouTube"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'DOWNLOAD_ERROR',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        audio_file_path = download_result["audio_file_path"]
        video_title = download_result["video_title"]

        # Step 2: Check File Size and Chunk if Necessary
        chunks = chunk_audio_file(audio_file_path, temp_dir)
        if not chunks:
            error_msg = "Failed to process audio file - file may be corrupted or in an unsupported format"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'AUDIO_PROCESSING_ERROR',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        total_chunks = len(chunks)
        if total_chunks == 0:
            error_msg = "No valid audio chunks to process"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'AUDIO_PROCESSING_ERROR',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        # Step 3: Assign API Keys to Chunks
        api_keys_assigned = rotate_api_keys(total_chunks)
        for i, chunk in enumerate(chunks):
            chunk["api_key"] = api_keys_assigned[i]

        # Step 4: Transcribe All Chunks
        transcription_results = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_chunk = {executor.submit(transcribe_audio_chunk, chunk_info): chunk_info for chunk_info in chunks}
            for future in as_completed(future_to_chunk):
                try:
                    result = future.result()
                    if result:
                        transcription_results.append(result)
                except Exception as e:
                    error_msg = f"Transcription failed: {str(e)}"
                    logging.error(error_msg)
                    jobs_collection.update_one(
                        {'job_id': job_id},
                        {'$set': {
                            'status': 'failed',
                            'error': error_msg,
                            'error_type': 'TRANSCRIPTION_API_ERROR',
                            'updated_at': datetime.utcnow()
                        }}
                    )
                    return

        if len(transcription_results) != total_chunks:
            error_msg = f"Incomplete transcription: Expected {total_chunks} chunks, got {len(transcription_results)}"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'INCOMPLETE_TRANSCRIPTION',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        # Step 5: Merge Transcriptions
        complete_transcript = merge_transcriptions(transcription_results)
        
        # Validate merged transcription
        if not complete_transcript or not complete_transcript.get('text', '').strip():
            error_msg = "Generated transcript is empty"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'EMPTY_TRANSCRIPTION',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        # Step 6: Save Transcription to MongoDB
        transcription_doc = Transcription(
            id=video_id,  # Sets _id via alias
            video_title=video_title,
            transcription=complete_transcript,
            transcription_raw=complete_transcript['text'],
            created_at=datetime.utcnow()
        ).dict(by_alias=True)  # Ensures _id is set correctly

        try:
            transcriptions_collection.insert_one(transcription_doc)
            logging.info(f"Transcription for video_id {video_id} inserted successfully.")
        except DuplicateKeyError:
            error_msg = f"Transcription for video_id {video_id} already exists"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'DUPLICATE_TRANSCRIPTION',
                    'updated_at': datetime.utcnow()
                }}
            )
            return
        except Exception as e:
            error_msg = f"Database error while saving transcription: {str(e)}"
            logging.error(error_msg)
            jobs_collection.update_one(
                {'job_id': job_id},
                {'$set': {
                    'status': 'failed',
                    'error': error_msg,
                    'error_type': 'DATABASE_ERROR',
                    'updated_at': datetime.utcnow()
                }}
            )
            return

        # Update job status to 'success'
        jobs_collection.update_one(
            {'job_id': job_id},
            {'$set': {'status': 'success', 'updated_at': datetime.utcnow()}}
        )

    except Exception as e:
        error_msg = f"Unexpected error during transcription: {str(e)}"
        logging.error(error_msg)
        jobs_collection.update_one(
            {'job_id': job_id},
            {'$set': {
                'status': 'failed',
                'error': error_msg,
                'error_type': 'UNEXPECTED_ERROR',
                'updated_at': datetime.utcnow()
            }}
        )

    finally:
        # Cleanup Temporary Files
        try:
            shutil.rmtree(temp_dir)
        except Exception as e:
            logging.error(f"Error cleaning up temporary files: {e}")

        # Calculate and log overall duration
        overall_end_time = time.time()
        overall_duration = overall_end_time - overall_start_time
        logging.info(f"Total processing time: {overall_duration:.2f} seconds")
