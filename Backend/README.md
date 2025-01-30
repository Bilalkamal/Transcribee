<div align="center">

# 🐝 Transcrib.ee - Backend

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Redis](https://img.shields.io/badge/Redis-b02C20?style=for-the-badge&logo=redis)](https://redis.io/)
[![Mongo](https://img.shields.io/badge/Mongo-70D059?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Flask](https://img.shields.io/badge/Flask-000030?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
> **Revolutionizing video transcription with AI-powered accuracy and speed.**

Transcrib.ee is a cutting-edge YouTube video transcription service leveraging advanced AI to deliver high-quality text transcriptions. Designed with scalability, performance, and accuracy in mind, it utilizes a distributed microservices architecture to handle videos of any length efficiently.

</div>

## 🎯 Overview

Transcrib.ee simplifies video transcription with features like:
- Distributed microservices architecture for scalability
- Intelligent audio chunking and caching for performance
- Real-time job tracking and result retrieval

This backend comprises three key components:

| Component                 | Technology  | Role                                             |
|---------------------------|-------------|--------------------------------------------------|
| **FastAPI Service**       | FastAPI     | Handles API requests and job status monitoring   |
| **Flask Transcription**   | Flask       | Manages transcription tasks and audio processing |
| **Redis Worker Service**  | Redis Queue | Processes background tasks asynchronously        |

## ✨ Features

### Core Features
- 🚀 **AI-Powered Transcriptions**: High-quality text from YouTube videos
- 📊 **Real-Time Job Tracking**: Monitor job progress instantly
- 🛡️ **Scalable Architecture**: Handles videos of any length

### Advanced Capabilities
- **Intelligent Processing Pipeline**
  - Automatic audio chunking for large videos
  - Smart API key rotation for balanced workloads
  - Parallel processing of audio chunks
- **Robust Data Management**
  - MongoDB-based caching for faster result retrieval
  - Persistent job tracking and efficient cleanup
- **High Availability**
  - Redis-powered task queue with failure recovery
  - Health check endpoints for proactive monitoring

## 📁 Architecture Overview

```bash
.
├── FastAPI Service (Port 8000)
│   ├── Handles API requests, input validation, and result caching
│   └── Connects to MongoDB for persistent storage
├── Flask Transcription Service (Port 9696)
│   ├── Processes audio and manages transcription logic
│   └── Utilizes API key rotation for optimal performance
└── Redis Worker Service
    ├── Processes asynchronous jobs
    └── Manages job status and failure recovery
```

## 🛠️ Technology Stack

| Component       | Technology       |
|-----------------|------------------|
| **Backend**     | FastAPI, Flask   |
| **Database**    | MongoDB          |
| **Queue System**| Redis            |

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- Python 3.9+
- Node.js 16+ and npm (required for YouTube token generation)
- Redis server
- MongoDB instance

### Environment Variables
Create a `.env` file in the root directory and populate it with:

```bash
MONGODB_URL=<your_mongodb_url>
DATABASE_NAME=<your_database_name>
API_KEYS=<comma_separated_api_keys>
YOUTUBE_VISITOR_DATA=<your_visitor_data>
YOUTUBE_PO_TOKEN=<your_token>
```

### Starting the Services

1. **Start the FastAPI server:**
   ```bash
   uvicorn api.main:app --reload
   ```

2. **Start the Flask transcription server:**
   ```bash
   python -m flask_transcriber.app
   ```

3. **Start the Redis worker:**
   ```bash
   python -m redis_worker.worker
   ```

## 📜 API Workflow

### 1. Submit a transcription request

```bash
curl -X POST "https://api.transcrib.ee/transcribe/" \
     -H "Content-Type: application/json" \
     -d '{"youtube_url": "https://www.youtube.com/watch?v=your_video_id"}'
```
Response:
```json
{
    "status": "success",
    "job_id": "unique_job_id",
    "message": "Transcription job created successfully"
}
```

### 2. Poll for job status

```bash
curl "https://api.transcrib.ee/transcribe/status/{job_id}"
```
Response:
```json
{
    "status": "completed",
    "job_id": "unique_job_id",
    "video_id": "youtube_video_id",
    "video_title": "Video Title",
    "transcription": {
        "text": "Full transcription text...",
        "chunks": [...],
        "metadata": {...}
    }
}
```

## 🔄 Processing Flow

1. Client submits a YouTube URL.
2. **FastAPI Service:** Validates the URL and creates a new transcription job.
3. **Redis Worker:** Picks up the job, downloads audio, and chunks large files.
4. **Flask Transcription Service:** Processes chunks in parallel and merges results.
5. Final transcription is stored in MongoDB for retrieval.

## 🛣️ Roadmap

- [ ] Add support for subtitles and multilingual transcriptions
- [ ] Enable streaming transcription for live videos
- [ ] Implement advanced usage analytics for admins

## 🤝 Contributing

We welcome contributions from the community! Feel free to:
- Report bugs or suggest new features [here](https://github.com/Bilalkamal/Transcribee/issues)
- Fork the repository and submit pull requests

## 📬 Connect With Us

<div align="center">

[![Email](https://img.shields.io/badge/Email-hello@transcrib.ee-red?style=for-the-badge)](mailto:hello@transcrib.ee)
[![GitHub](https://img.shields.io/badge/GitHub-@Bilalkamal-black?style=for-the-badge&logo=github)](https://github.com/Bilalkamal/Transcribee)
[![Website](https://img.shields.io/badge/Website-Transcrib.ee-blue?style=for-the-badge)](https://transcrib.ee)

</div>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
