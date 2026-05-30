from services.youtube_ingestion import get_transcript
from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.retrival_service import retrive_context
from services.llm_service import generate_answer

url = input("Enter YouTube URL: ")

transcript = get_transcript(url)

chunks = chunk_text(transcript)

embeddings = create_embeddings(chunks)

create_collection()
store_chunks(chunks, embeddings)

print("\nChunks stored in Qdrant successfully")

print(f"\nTranscript Length: {len(transcript)}")
print(f"Chunks Created: {len(chunks)}")
print(f"Embeddings Created: {len(embeddings)}")
print(f"Embedding Dimension: {len(embeddings[0])}")

question = input("\nAsk a question about the video: ")

results = retrive_context(question)

context = "\n".join(
    [result.payload["text"] for result in results]
)

answer = generate_answer(question, context)

print("\nAnswer:\n")
print(answer)