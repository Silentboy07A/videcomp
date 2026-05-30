import yt_dlp

def get_instagram_metadata(url):

    ydl_opts = {
        "quiet": True,
        "no_warnings": True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            url,
            download=False
        )

    views = info.get("view_count") or 0
    likes = info.get("like_count") or 0
    comments = info.get("comment_count") or 0

    engagement_rate = 0

    if views > 0:
        engagement_rate = round(
            ((likes + comments) / views) * 100,
            2
        )

    return {
        "title": info.get("title"),
        "creator": info.get("uploader"),
        "views": views,
        "likes": likes,
        "comments": comments,
        "duration_seconds": info.get("duration"),
        "upload_date": info.get("upload_date"),
        "engagement_rate": engagement_rate
    }
    print("\nDEBUG INSTAGRAM KEYS:")
print(info.keys())