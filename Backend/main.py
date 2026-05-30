from services.youtube_ingestion import get_transcript
from services.instagram_ingestion import get_instagram_transcript

from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.retrival_service import retrive_context
from services.langchain_rag import generate_rag_answer

from youtube_metadata import get_video_metadata

youtube_url = input("Enter YouTube URL: ")
instagram_url = input("Enter Instagram Reel URL: ")

youtube_metadata = get_video_metadata(youtube_url)

print("\nYouTube Metadata:")
print(f"Title: {youtube_metadata['title']}")
print(f"Creator: {youtube_metadata['creator']}")
print(f"Views: {youtube_metadata['views']}")
print(f"Likes: {youtube_metadata['likes']}")
print(f"Comments: {youtube_metadata['comments']}")
print(f"Upload Date: {youtube_metadata['upload_date']}")
print(f"Duration (sec): {youtube_metadata['duration_seconds']}")
print(f"Engagement Rate: {youtube_metadata['engagement_rate']}%")

print("\nGetting YouTube Transcript...")
youtube_transcript = get_transcript(youtube_url)

print("\nGetting Instagram Transcript...")
instagram_transcript = get_instagram_transcript(
    instagram_url
)

print("\nInstagram Transcript Length:")
print(len(instagram_transcript))

print("\nInstagram Transcript Preview:")
print(instagram_transcript[:1000])

youtube_chunks = chunk_text(youtube_transcript)
youtube_embeddings = create_embeddings(youtube_chunks)

instagram_chunks = chunk_text(instagram_transcript)
instagram_embeddings = create_embeddings(instagram_chunks)

create_collection()

store_chunks(
    youtube_chunks,
    youtube_embeddings,
    "A"
)

store_chunks(
    instagram_chunks,
    instagram_embeddings,
    "B"
)

print(f"\nYouTube Chunks: {len(youtube_chunks)}")
print(f"Instagram Chunks: {len(instagram_chunks)}")
print(f"Total Chunks: {len(youtube_chunks) + len(instagram_chunks)}")
print(f"Embedding Dimension: {len(youtube_embeddings[0])}")

question = input(
    "\nAsk a comparison question about the videos: "
)

results = retrive_context(question)

retrieved_context = "\n".join(
    [result.payload["text"] for result in results]
)

full_context = f"""
VIDEO A (YOUTUBE)

Metadata:
Title: {youtube_metadata['title']}
Creator: {youtube_metadata['creator']}
Views: {youtube_metadata['views']}
Likes: {youtube_metadata['likes']}
Comments: {youtube_metadata['comments']}
Upload Date: {youtube_metadata['upload_date']}
Duration: {youtube_metadata['duration_seconds']}
Engagement Rate: {youtube_metadata['engagement_rate']}%

Retrieved Context:
{retrieved_context}
"""

answer = generate_rag_answer(
    question,
    full_context
)

print("\nAnswer:\n")
print(answer)