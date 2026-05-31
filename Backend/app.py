import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.youtube_ingestion import (
    get_transcript,
    get_first_5_seconds
)
from services.instagram_ingestion import get_instagram_transcript

from services.chunking import chunk_text
from services.embedding_service import create_embeddings
from services.vector_store import create_collection, store_chunks
from services.langchain_rag import generate_rag_answer, stream_rag_answer

from youtube_metadata import get_video_metadata
from services.instagram_metadata import get_instagram_metadata


logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

youtube_metadata = {}
instagram_metadata = {}
youtube_hook = ""
instagram_hook = ""

chat_history = []

HOOK_KEYWORDS = [
    "hook",
    "opening",
    "intro",
    "first few seconds",
    "beginning",
    "start of",
    "first 5",
    "first five",
    "opens with",
    "opening line",
]


def is_hook_question(question: str) -> bool:
    q = question.lower()
    return any(kw in q for kw in HOOK_KEYWORDS)


def build_hook_context():
    return f"""
VIDEO A (YOUTUBE) — OPENING HOOK
Title: {youtube_metadata.get('title', 'Unknown')}
Creator: {youtube_metadata.get('creator', 'Unknown')}

Hook transcript (first ~5 seconds):
{youtube_hook}

VIDEO B (INSTAGRAM) — OPENING HOOK
Title: {instagram_metadata.get('title', 'Unknown')}
Creator: {instagram_metadata.get('creator', 'Unknown')}

Hook transcript (opening portion):
{instagram_hook}
"""


def build_full_context(youtube_results, instagram_results):
    youtube_context = "\n".join(
        [r.payload["text"] for r in youtube_results]
    )
    instagram_context = "\n".join(
        [r.payload["text"] for r in instagram_results]
    )
    history_context = "\n".join(
        [
            f"Q: {item['question']}\nA: {item['answer']}"
            for item in chat_history[-5:]
        ]
    )
    return f"""
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


class IngestRequest(BaseModel):
    youtube_url: str
    instagram_url: str


class QuestionRequest(BaseModel):
    question: str


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
            "traceback": tb
        }
    )


@app.get("/")
def home():
    return {
        "message": "VidComp API Running"
    }


@app.post("/ingest")
def ingest_videos(data: IngestRequest):

    global youtube_metadata
    global instagram_metadata
    global youtube_hook
    global instagram_hook

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

        youtube_hook = get_first_5_seconds(
            data.youtube_url
        )

        instagram_hook = instagram_transcript[:300]

        logger.info(
            "[HOOK] YouTube hook length: %d chars",
            len(youtube_hook)
        )
        logger.info(
            "[HOOK] Instagram hook length: %d chars",
            len(instagram_hook)
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

    if is_hook_question(data.question):

        hook_context = build_hook_context()

        answer = generate_rag_answer(
            data.question,
            hook_context
        )

        chat_history.append(
            {
                "question": data.question,
                "answer": answer
            }
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "video_id": "A",
                    "chunk_id": "hook"
                },
                {
                    "video_id": "B",
                    "chunk_id": "hook"
                }
            ],
            "memory_size": len(chat_history)
        }

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

    full_context = build_full_context(
        youtube_results,
        instagram_results
    )

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


@app.post("/ask-stream")
def ask_question_stream(data: QuestionRequest):

    from services.retrival_service import (
        retrieve_context_by_video
    )

    global chat_history

    if is_hook_question(data.question):

        hook_context = build_hook_context()

        def hook_token_generator():
            full_answer = ""
            for token in stream_rag_answer(
                data.question,
                hook_context
            ):
                full_answer += token
                yield token
            chat_history.append(
                {
                    "question": data.question,
                    "answer": full_answer
                }
            )

        return StreamingResponse(
            hook_token_generator(),
            media_type="text/plain"
        )

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
        def empty_generator():
            msg = "Information not found in the provided videos."
            yield msg

        return StreamingResponse(
            empty_generator(),
            media_type="text/plain"
        )

    full_context = build_full_context(
        youtube_results,
        instagram_results
    )

    def token_generator():
        full_answer = ""
        for token in stream_rag_answer(
            data.question,
            full_context
        ):
            full_answer += token
            yield token
        chat_history.append(
            {
                "question": data.question,
                "answer": full_answer
            }
        )

    return StreamingResponse(
        token_generator(),
        media_type="text/plain"
    )


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "vector_db": "connected",
        "memory_size": len(chat_history)
    }