import yt_dlp
import os

ffmpeg_bin = r"C:\Users\csbal\Downloads\ffmpeg-8.1.1-essentials_build\ffmpeg-8.1.1-essentials_build\bin"

os.environ["PATH"] = ffmpeg_bin + os.pathsep + os.environ["PATH"]
def download_reel(url):

    ydl_opts = {
        "outtmpl": "temp_instagram.mp4"
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return "temp_instagram.mp4"
import whisper

model = whisper.load_model("base")

def get_instagram_transcript(url):

    video_path = download_reel(url)

    result = model.transcribe(video_path)

    return result["text"]