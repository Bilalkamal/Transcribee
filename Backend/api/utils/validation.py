# api/utils/validation.py
import re
from urllib.parse import urlparse, parse_qs
from typing import Optional

def validate_youtube_url(url: str) -> bool:
    regex = r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$'
    return re.match(regex, url) is not None

def extract_video_id(url: str) -> Optional[str]:
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    elif parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            query = parse_qs(parsed_url.query)
            return query.get('v', [None])[0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]
    return None
