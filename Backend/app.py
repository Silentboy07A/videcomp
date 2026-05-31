import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.youtube_ingestion import get_transcript
from services.instagram_ingestion import get_instagram_transcript

from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.langchain_rag import generate_rag_answer

from youtube_metadata import get_video_metadata
from services.instagram_metadata import get_instagram_metadata

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# ── App ──────────────────────────────────────────────────
app = FastAPI()

youtube_metadata = {}
instagram_metadata = {}
chat_history = []


# ── Global exception handler ────────────────────────────
# Shows the REAL traceback in the 500 response during
# development. Remove the "traceback" field in production.

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    tb = traceback.format_exc()
    logger.error(
        "Unhandled exception on %s %s:\n%s",
        request.method, request.url, tb
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "detail": str(exc),
            "traceback": tb  # ← REMOVE IN PRODUCTION
        }
    )


# ── Models ───────────────────────────────────────────────

class IngestRequest(BaseModel):
    youtube_url: str
    instagram_url: str


class QuestionRequest(BaseModel):
    question: str


# ── Endpoints ────────────────────────────────────────────

@app.get("/")
def home():
    return {
        "message": "VidComp API Running"
    }


@app.post("/ingest")
def ingest_videos(data: IngestRequest):

    global youtube_metadata
    global instagram_metadata

    if (
        "youtube.com" not in data.youtube_url
        and
        "youtu.be" not in data.youtube_url
    ):
        return {
            "error": "Invalid YouTube URL"
        }

    if "instagram.com" not in data.instagram_url:
        return {
            "error": "Invalid Instagram URL"
        }

    try:
        logger.info("[1/7] Fetching YouTube metadata...")
        youtube_metadata = get_video_metadata(
            data.youtube_url
        )

        logger.info("[2/7] Fetching Instagram metadata...")
        instagram_metadata = get_instagram_metadata(
            data.instagram_url
        )

        logger.info("[3/7] Getting YouTube transcript...")
        youtube_transcript = get_transcript(
            data.youtube_url
        )

        logger.info("[4/7] Getting Instagram transcript...")
        instagram_transcript = get_instagram_transcript(
            data.instagram_url
        )

        logger.info("[5/7] Chunking & embedding...")
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

        logger.info("[6/7] Creating Qdrant collection...")
        create_collection()

        logger.info("[7/7] Storing vectors...")
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

        logger.info("[DONE] Ingestion complete")

        return {
            "status": "success",
            "youtube_chunks": len(youtube_chunks),
            "instagram_chunks": len(instagram_chunks)
        }

    except Exception as e:
        logger.error(
            "[INGEST FAILED] %s\n%s",
            str(e), traceback.format_exc()
        )
        raise


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

    if (
        len(youtube_results) == 0
        and
        len(instagram_results) == 0
    ):
        return {
            "answer": "Information not found in the provided videos.",
            "sources": [],
            "memory_size": len(chat_history)
        }

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