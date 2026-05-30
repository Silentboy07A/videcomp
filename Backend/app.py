from fastapi import FastAPI
from pydantic import BaseModel

from services.youtube_ingestion import get_transcript
from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.retrival_service import retrive_context
from services.langchain_rag import generate_rag_answer

app = FastAPI()

class IngestRequest(BaseModel):
    url: str

class QuestionRequest(BaseModel):
    question: str

@app.post("/ingest")
def ingest_video(data: IngestRequest):

    transcript = get_transcript(data.url)

    chunks = chunk_text(transcript)

    embeddings = create_embeddings(chunks)

    create_collection()
    store_chunks(chunks, embeddings)

    return {
        "status": "success",
        "chunks": len(chunks)
    }

@app.post("/ask")
def ask_question(data: QuestionRequest):

    results = retrive_context(data.question)

    context = "\n".join(
        [r.payload["text"] for r in results]
    )

    answer = generate_rag_answer(
        data.question,
        context
    )

    return {
        "answer": answer
    }