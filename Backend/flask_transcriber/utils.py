# flask_transcriber/utils.py
import re
import os
from pytubefix import YouTube
import logging
import shutil
import tempfile
import subprocess
from typing import Optional, Dict, Any
from pathlib import Path

def sanitize_filename(name: str) -> str:
    """
    Sanitizes the video title to create a valid filename.
    """
    sanitized = re.sub(r'[\\/*?:"<>|]', "", name)
    sanitized = sanitized.strip()
    sanitized = re.sub(r'\s+', '_', sanitized)
    return sanitized

def get_youtube_tokens() -> Optional[Dict[str, str]]:
    """
    Get authorization tokens using Node.js token generator.
    Returns a dictionary with visitor_data and po_token or None if failed.
    """
    logging.info("Starting YouTube token generation process...")
    
    try:
        repo_path = Path('youtube-po-token-generator')
        
        # Clone repository if it doesn't exist
        if not repo_path.exists():
            logging.info("Cloning token generator repository...")
            subprocess.run(
                ['git', 'clone', 'https://github.com/YunzheZJU/youtube-po-token-generator.git'],
                check=True,
                capture_output=True
            )
            logging.info("Installing Node.js dependencies...")
            subprocess.run(
                ['npm', 'install'],
                cwd=repo_path,
                check=True,
                capture_output=True
            )
        else:
            logging.info("Token generator already installed")

        # Generate fresh tokens
        logging.info("Generating fresh tokens...")
        result = subprocess.run(
            ['node', 'examples/one-shot.js'],
            capture_output=True,
            text=True,
            check=True,
            cwd=repo_path
        )

        # Parse tokens from output
        tokens = {
            'visitorData': None,
            'poToken': None
        }
        
        for line in result.stdout.splitlines():
            if 'visitorData' in line:
                tokens['visitorData'] = line.split("'")[1]
                logging.info("Found visitor_data token")
            elif 'poToken' in line:
                tokens['poToken'] = line.split("'")[1]
                logging.info("Found po_token")

        if tokens['visitorData'] and tokens['poToken']:
            logging.info("Successfully obtained tokens")
            return tokens
        
        logging.error("Failed to extract tokens from output")
        logging.error(f"Token generator output: {result.stdout}")
        return None

    except Exception as e:
        logging.error(f"Error in token generation: {str(e)}")
        return None

def download_youtube_audio(video_id: str, download_dir: str) -> Optional[Dict[str, Any]]:
    """
    Downloads audio from YouTube. First tries to get audio stream directly,
    falls back to downloading video and extracting audio if necessary.
    """
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    logging.info(f"Starting download process for video ID: {video_id}")
    
    try:
        # Check if ffmpeg is installed (needed for both paths)
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            logging.info("FFmpeg is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logging.error("FFmpeg not found. Please install FFmpeg first.")
            return None

        # Get authorization tokens
        tokens = get_youtube_tokens()
        if not tokens:
            logging.error("Failed to obtain YouTube tokens - aborting download")
            return None

        logging.info("Initializing YouTube object with tokens...")
        yt = YouTube(
            video_url,
            use_oauth=False,
            allow_oauth_cache=False,
            use_po_token=True,
            po_token_verifier=lambda: (tokens['visitorData'], tokens['poToken'])
        )
        
        logging.info("Checking video availability...")
        yt.check_availability()
        video_title = yt.title or video_id
        logging.info(f"Video title: {video_title}")
        
        # Get all audio streams and find the best compatible one
        logging.info("Attempting to find audio-only stream...")
        audio_streams = yt.streams.filter(only_audio=True)
        
        # Try to find MP4/M4A audio stream with highest bitrate
        audio_stream = None
        for stream in audio_streams:
            if stream.subtype in ['mp4', 'm4a']:
                if audio_stream is None or stream.abr > audio_stream.abr:
                    audio_stream = stream
                    
        if audio_stream:
            logging.info(f"Found compatible audio stream: {audio_stream}")
            
            # Prepare paths
            sanitized_title = sanitize_filename(video_title)
            final_audio_path = os.path.join(download_dir, f"{sanitized_title}.{audio_stream.subtype}")

            # Add progress callback
            def progress_callback(stream, chunk, bytes_remaining):
                total_size = stream.filesize
                bytes_downloaded = total_size - bytes_remaining
                percentage = (bytes_downloaded / total_size) * 100
                logging.info(f"Download progress: {percentage:.1f}%")
                
            yt.register_on_progress_callback(progress_callback)

            try:
                # Download directly to final path
                audio_file = audio_stream.download(
                    output_path=download_dir,
                    filename=sanitized_title + '.' + audio_stream.subtype
                )
                logging.info("Audio download completed")
                final_audio_path = audio_file
                
            except Exception as e:
                logging.error(f"Audio download failed: {str(e)}")
                return None

        else:
            # No compatible audio stream, fall back to video
            logging.info("No compatible audio stream available, falling back to video download...")
            video_stream = yt.streams.get_lowest_resolution()
            if not video_stream:
                logging.error("No suitable video stream found")
                return None

            logging.info(f"Selected video stream: {video_stream}")
            sanitized_title = sanitize_filename(video_title)
            final_audio_path = os.path.join(download_dir, f"{sanitized_title}.m4a")
            
            try:
                # Download video to temp file
                temp_video = os.path.join(download_dir, "temp_video.mp4")
                video_stream.download(
                    output_path=download_dir,
                    filename="temp_video.mp4"
                )
                logging.info("Video download completed")

                # Extract audio from video
                logging.info("Extracting audio from video...")
                command = [
                    'ffmpeg',
                    '-i', temp_video,
                    '-vn',  # No video
                    '-acodec', 'aac',  # Use AAC codec for m4a
                    '-b:a', '128k',  # Bitrate
                    '-y',
                    final_audio_path
                ]
                subprocess.run(command, check=True, capture_output=True)
                os.remove(temp_video)  # Remove temporary video file
                logging.info("Audio extraction completed")
                
            except Exception as e:
                logging.error(f"Video download/conversion failed: {str(e)}")
                return None

        # Verify final audio file
        if not os.path.exists(final_audio_path):
            logging.error("Final audio file does not exist")
            return None

        file_size = os.path.getsize(final_audio_path)
        logging.info(f"Final audio file size: {file_size} bytes")
        
        if file_size == 0:
            logging.error("Final audio file is empty")
            return None

        return {
            "audio_file_path": final_audio_path,
            "video_title": video_title,
            "file_size": file_size
        }

    except Exception as e:
        logging.error(f"Error in download process: {str(e)}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        return None

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
