from fastapi import FastAPI
from pydantic import BaseModel

from services.youtube_ingestion import get_transcript
from services.instagram_ingestion import get_instagram_transcript

from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.langchain_rag import generate_rag_answer

from youtube_metadata import get_video_metadata
from services.instagram_metadata import get_instagram_metadata

app = FastAPI()

youtube_metadata = {}
instagram_metadata = {}

chat_history = []


class IngestRequest(BaseModel):
    youtube_url: str
    instagram_url: str


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "VidComp API Running"
    }


@app.post("/ingest")
def ingest_videos(data: IngestRequest):

    global youtube_metadata
    global instagram_metadata

    youtube_metadata = get_video_metadata(
        data.youtube_url
    )

    instagram_metadata = get_instagram_metadata(
        data.instagram_url
    )

    youtube_transcript = get_transcript(
        data.youtube_url
    )

    instagram_transcript = get_instagram_transcript(
        data.instagram_url
    )

    youtube_chunks = chunk_text(
        youtube_transcript
    )

    instagram_chunks = chunk_text(
        instagram_transcript
    )

    youtube_embeddings = create_embeddings(
        youtube_chunks
    )

    instagram_embeddings = create_embeddings(
        instagram_chunks
    )

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

    return {
        "status": "success",
        "youtube_chunks": len(youtube_chunks),
        "instagram_chunks": len(instagram_chunks)
    }


@app.post("/ask")
def ask_question(data: QuestionRequest):

    from services.retrival_service import (
        retrieve_context_by_video
    )

    global chat_history

    youtube_results = retrieve_context_by_video(
        data.question,
        "A"
    )

    instagram_results = retrieve_context_by_video(
        data.question,
        "B"
    )

    youtube_context = "\n".join(
        [
            r.payload["text"]
            for r in youtube_results
        ]
    )

    instagram_context = "\n".join(
        [
            r.payload["text"]
            for r in instagram_results
        ]
    )

    history_context = "\n".join(
        [
            f"Q: {item['question']}\nA: {item['answer']}"
            for item in chat_history[-5:]
        ]
    )

    full_context = f"""
CONVERSATION HISTORY

{history_context}

VIDEO A (YOUTUBE)

Metadata:
{youtube_metadata}

Context:
{youtube_context}

VIDEO B (INSTAGRAM)

Metadata:
{instagram_metadata}

Context:
{instagram_context}
"""

    answer = generate_rag_answer(
        data.question,
        full_context
    )

    chat_history.append(
        {
            "question": data.question,
            "answer": answer
        }
    )

    sources = []

    for r in youtube_results:
        sources.append(
            {
                "video_id": r.payload.get(
                    "video_id"
                ),
                "chunk_id": r.payload.get(
                    "chunk_id"
                )
            }
        )

    for r in instagram_results:
        sources.append(
            {
                "video_id": r.payload.get(
                    "video_id"
                ),
                "chunk_id": r.payload.get(
                    "chunk_id"
                )
            }
        )

    return {
        "answer": answer,
        "sources": sources,
        "memory_size": len(chat_history)
    }