from services.youtube_ingestion import get_transcript
from services.chunking import chunk_text

url = input("Enter YouTube URL: ")

transcript = get_transcript(url)

chunks = chunk_text(transcript)

print(f"\nTranscript Length: {len(transcript)}")
print(f"\nChunks Created: {len(chunks)}")

print("\nFirst Chunk:\n")
print(chunks[0])