from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def extract_video_id(url):
    parsed_url = urlparse(url)
    return parse_qs(parsed_url.query)["v"][0]

def get_transcript(url):
    video_id = extract_video_id(url)

    transcript_list = YouTubeTranscriptApi().fetch(video_id)

    text = " ".join([item.text for item in transcript_list])

    return text