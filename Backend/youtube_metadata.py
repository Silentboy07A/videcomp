import os
from urllib.parse import urlparse, parse_qs

from googleapiclient.discovery import build
from dotenv import load_dotenv
import isodate

load_dotenv()

youtube = build(
    "youtube",
    "v3",
    developerKey=os.getenv("YOUTUBE_API_KEY")
)

def extract_video_id(url):
    parsed = urlparse(url)

    if "youtu.be" in parsed.netloc:
        return parsed.path[1:]

    return parse_qs(parsed.query)["v"][0]

def get_video_metadata(url):

    video_id = extract_video_id(url)

    response = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=video_id
    ).execute()

    item = response["items"][0]

    snippet = item["snippet"]
    stats = item["statistics"]

    duration = isodate.parse_duration(
        item["contentDetails"]["duration"]
    )

    views = int(stats.get("viewCount", 0))
    likes = int(stats.get("likeCount", 0))
    comments = int(stats.get("commentCount", 0))

    engagement_rate = 0

    if views > 0:
        engagement_rate = ((likes + comments) / views) * 100

    return {
        "title": snippet["title"],
        "creator": snippet["channelTitle"],
        "views": views,
        "likes": likes,
        "comments": comments,
        "upload_date": snippet["publishedAt"],
        "duration_seconds": int(duration.total_seconds()),
        "engagement_rate": round(engagement_rate, 2)
    }