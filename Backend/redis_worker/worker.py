# redis_worker/worker.py
import redis
import threading
import time
import json
import requests
import logging
from typing import Dict

# Configuration
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
MAX_CONCURRENT_TASKS = 5
FLASK_ENDPOINT_URL = 'http://localhost:9696/process_transcription'
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Initialize Redis client
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

# Configure Logging
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

def invoke_flask_endpoint(job_data: Dict[str, str]):
    job_id = job_data['job_id']
    video_id = job_data['video_id']

    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            response = requests.post(
                FLASK_ENDPOINT_URL,
                json={'job_id': job_id, 'video_id': video_id},
                timeout=7200  # Adjust timeout as needed
            )
            if response.status_code == 200:
                logging.info(f"Job {job_id} processed successfully.")
                break
            else:
                logging.warning(f"Job {job_id} failed with status code {response.status_code}.")
                attempt += 1
                time.sleep(RETRY_DELAY)
        except requests.RequestException as e:
            logging.error(f"Exception occurred while invoking Flask endpoint for job {job_id}: {e}")
            attempt += 1
            time.sleep(RETRY_DELAY)
    else:
        logging.error(f"Job {job_id} failed after {MAX_RETRIES} attempts.")

def worker_loop():
    active_tasks = []
    while True:
        # Clean up completed tasks
        active_tasks = [t for t in active_tasks if t.is_alive()]

        # If we have capacity, fetch new jobs from the queue
        while len(active_tasks) < MAX_CONCURRENT_TASKS:
            job_data_raw = redis_client.lpop("transcription_queue")
            if job_data_raw:
                job_data = json.loads(job_data_raw)
                # Start a new thread to invoke the Flask endpoint
                t = threading.Thread(target=invoke_flask_endpoint, args=(job_data,))
                t.start()
                active_tasks.append(t)
                logging.info(f"Started processing job {job_data['job_id']}.")
            else:
                # No jobs in the queue
                break

        # Sleep before checking again
        time.sleep(5)

if __name__ == "__main__":
    logging.info("Starting Redis worker...")
    worker_loop()
