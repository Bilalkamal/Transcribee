# flask_transcriber/utils.py
import re
import os
from pytubefix import YouTube
import logging
import shutil
import tempfile
import subprocess
from typing import Optional, Dict, Any

def sanitize_filename(name: str) -> str:
    """
    Sanitizes the video title to create a valid filename.
    """
    sanitized = re.sub(r'[\\/*?:"<>|]', "", name)
    sanitized = sanitized.strip()
    sanitized = re.sub(r'\s+', '_', sanitized)
    return sanitized

def download_youtube_audio(video_id: str, download_dir: str) -> Optional[Dict[str, Any]]:
    """
    Downloads the audio from a YouTube video.
    """
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        # Custom po_token verifier function to avoid CLI input
        def po_token_verifier():
            return {
                "visitor_data": os.getenv("YOUTUBE_VISITOR_DATA", ""),
                "po_token": os.getenv("YOUTUBE_PO_TOKEN", "")
            }
            
        yt = YouTube(
            video_url, 
            use_po_token=True,
            po_token_verifier=po_token_verifier
        )
        yt.check_availability()
        video_title = yt.title or video_id
    except Exception as e:
        logging.error(f"Error fetching video info for {video_id}: {e}")
        return None

    sanitized_title = sanitize_filename(video_title)
    audio_stream = yt.streams.filter(only_audio=True).first()
    if not audio_stream:
        logging.error(f"No audio stream available for video {video_id}.")
        return None

    file_extension = audio_stream.subtype or 'm4a'
    filename = f"{sanitized_title}.{file_extension}"
    audio_file_path = os.path.join(download_dir, filename)

    try:
        audio_file = audio_stream.download(output_path=download_dir, filename=filename)
    except Exception as e:
        logging.error(f"Error downloading audio for video {video_id}: {e}")
        return None

    try:
        file_size = os.path.getsize(audio_file)
    except Exception as e:
        logging.error(f"Error getting file size for {audio_file}: {e}")
        file_size = 0

    return {
        "audio_file_path": audio_file,
        "video_title": video_title,
        "file_size": file_size
    }

def chunk_audio_file(audio_file_path: str, temp_dir: str, max_size: int = 25 * 1024 * 1024) -> Optional[list]:
    """
    Splits the audio file into chunks if it exceeds the max_size.
    """
    try:
        original_size = os.path.getsize(audio_file_path)
    except Exception as e:
        logging.error(f"Error getting file size for {audio_file_path}: {e}")
        return None

    if original_size <= max_size:
        logging.info("Audio file is within the size limit. Proceeding without chunking.")
        return [{"chunk_path": audio_file_path, "chunk_index": 1}]

    logging.info("Audio file exceeds the size limit. Chunking required.")
    CHUNK_DURATION = 600  
    base_filename = os.path.splitext(os.path.basename(audio_file_path))[0]
    file_extension = os.path.splitext(audio_file_path)[1].lstrip('.')
    chunk_pattern = os.path.join(temp_dir, f"{base_filename}_chunk_%03d.{file_extension}")
    
    ffmpeg_path = shutil.which('ffmpeg') or '/usr/bin/ffmpeg'
    command = [
        ffmpeg_path,
        "-threads", "0",
        "-i", audio_file_path,
        "-f", "segment",
        "-segment_time", str(CHUNK_DURATION),
        "-c", "copy",
        chunk_pattern,
        "-y"
    ]
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        chunk_files = sorted([
            os.path.join(temp_dir, f) for f in os.listdir(temp_dir)
            if f.startswith(f"{base_filename}_chunk_") and f.endswith(f".{file_extension}")
        ])
        return [{"chunk_path": path, "chunk_index": idx + 1} for idx, path in enumerate(chunk_files)]
    except subprocess.CalledProcessError as e:
        logging.error(f"Error during chunking with FFmpeg {audio_file_path}: {e.stderr.decode()}")
        return None
