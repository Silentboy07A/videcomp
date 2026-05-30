from services.embedding_service import model

from services.vector_store import (
    search_chunks,
    search_chunks_by_video
)

def retrive_context(query):

    query_embedding = model.encode(query)

    return search_chunks(
        query_embedding
    )

def retrieve_context_by_video(
    query,
    video_id
):

    query_embedding = model.encode(query)

    return search_chunks_by_video(
        query_embedding,
        video_id
    )