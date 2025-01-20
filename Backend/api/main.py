# api/main.py
from fastapi import FastAPI
from api.routers import transcription, health
from api.middleware.access_control import AccessControlMiddleware
import logging

# Initialize FastAPI app
app = FastAPI(
    title="Transcrib.ee API",
    description="A simple API for transcribing YouTube videos.",
    version="1.0.0"
)


# Include Routers
app.include_router(transcription.router, prefix="/transcribe", tags=["Transcription"])
app.include_router(health.router, tags=["Health"])

# Add Middleware
app.add_middleware(AccessControlMiddleware)

# Configure Logging
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"message": "Welcome to the YouTube Transcription API. Health check OK."}
