from services.youtube_ingestion import get_transcript
from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.retrival_service import retrieve_context
url = input("Enter YouTube URL: ")

transcript = get_transcript(url)

chunks = chunk_text(transcript)

embeddings = create_embeddings(chunks)

create_collection()
store_chunks(chunks, embeddings)

print("\nChunks stored in Qdrant successfully")

print(f"\nTranscript Length: {len(transcript)}")
print(f"\nChunks Created: {len(chunks)}")
print(f"\nEmbeddings Created: {len(embeddings)}")
print(f"Embedding Dimension: {len(embeddings[0])}")

print("\nFirst Chunk:\n")
print(chunks[0])
question = input("\nAsk a question about the video: ")

results = retrieve_context(question)

print("\nTop Results:\n")

for idx, result in enumerate(results, 1):
    print(f"\nResult {idx}")
    print(result.payload["text"])
    print("-" * 50)