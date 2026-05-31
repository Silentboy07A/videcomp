import os
import sys
import atexit
import logging
import traceback
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)

logger = logging.getLogger(__name__)

COLLECTION_NAME = "video_chunks"
QDRANT_PATH = "./qdrant_data"

# ── Lazy-initialized client ─────────────────────────────
# NOT created at module level. This prevents the entire
# module from crashing during import when the .lock file
# is held by a stale process.
_client: QdrantClient | None = None


def get_client() -> QdrantClient:
    """
    Returns a singleton QdrantClient, creating it on first call.

    If the qdrant_data/.lock file is stale (left behind by a
    crashed process), attempts to remove it and retry once.
    """
    global _client

    if _client is not None:
        return _client

    try:
        logger.info(
            "[QDRANT] Opening local storage at '%s'",
            QDRANT_PATH
        )
        _client = QdrantClient(path=QDRANT_PATH)
        logger.info("[QDRANT] Connected successfully")

    except RuntimeError as e:
        
        if "already accessed" in str(e):
            logger.warning(
                "[QDRANT] Lock contention detected — "
                "attempting stale-lock recovery"
            )
            _client = _recover_stale_lock(e)
        else:
            raise

    
    atexit.register(_shutdown_client)

    return _client


def _recover_stale_lock(original_error: Exception) -> QdrantClient:
    """
    Removes qdrant_data/.lock and retries the connection.

    If the lock is genuinely held by a live process (not stale),
    os.remove() will raise PermissionError on Windows and we
    surface a clear message.
    """
    lock_path = os.path.join(QDRANT_PATH, ".lock")

    if not os.path.exists(lock_path):
        raise original_error

    try:
        os.remove(lock_path)
        logger.info("[QDRANT] Removed stale lock file")
    except PermissionError:
        raise RuntimeError(
            "Qdrant storage is locked by a LIVE process. "
            "Kill all other python/uvicorn processes first:\n"
            "  Get-Process python*,uvicorn* | Stop-Process -Force"
        ) from original_error

    client = QdrantClient(path=QDRANT_PATH)
    logger.info("[QDRANT] Connected after lock recovery")
    return client


def _shutdown_client():
    """Called by atexit to release the .lock file."""
    global _client
    if _client is not None:
        try:
            _client.close()
            logger.info("[QDRANT] Client closed cleanly")
        except Exception:
            pass
        _client = None


# ── Collection management ────────────────────────────────

def create_collection():
    """
    Creates the vector collection if it does not exist.
    Safe to call on every ingest — idempotent.
    """
    client = get_client()

    try:
        logger.info("[STEP] Checking existing collections...")

        collections = client.get_collections()

        existing = [
            c.name for c in collections.collections
        ]

        logger.info(
            "[STEP] Found collections: %s", existing
        )

        if COLLECTION_NAME not in existing:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE
                )
            )
            logger.info(
                "[STEP] Collection '%s' created",
                COLLECTION_NAME
            )
        else:
            logger.info(
                "[STEP] Collection '%s' already exists",
                COLLECTION_NAME
            )

    except Exception as e:
        logger.error(
            "[QDRANT ERROR] create_collection failed:\n%s",
            traceback.format_exc()
        )
        raise


# ── Vector storage ───────────────────────────────────────

def store_chunks(chunks, embeddings, video_id):
    """
    Upserts text chunks + embeddings into Qdrant.

    Uses uuid4 for point IDs (the previous hash-mod approach
    could produce collisions across runs).
    """
    client = get_client()

    try:
        logger.info(
            "[STEP] Storing %d chunks for video '%s'",
            len(chunks), video_id
        )

        points = []

        for idx, (chunk, embedding) in enumerate(
            zip(chunks, embeddings)
        ):
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding.tolist(),
                    payload={
                        "text": chunk,
                        "video_id": video_id,
                        "chunk_id": idx
                    }
                )
            )

        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )

        logger.info(
            "[STEP] Upserted %d points for video '%s'",
            len(points), video_id
        )

    except Exception as e:
        logger.error(
            "[QDRANT ERROR] store_chunks failed:\n%s",
            traceback.format_exc()
        )
        raise


# ── Search ───────────────────────────────────────────────

def search_chunks(query_embedding, limit=10):
    client = get_client()
    return client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding.tolist(),
        limit=limit
    )


def search_chunks_by_video(
    query_embedding,
    video_id,
    limit=5
):
    client = get_client()
    return client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding.tolist(),
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="video_id",
                    match=MatchValue(
                        value=video_id
                    )
                )
            ]
        ),
        limit=limit
    )