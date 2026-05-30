from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(":memory:")

COLLECTION_NAME = "video_chunks"

def create_collection():
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE
        )
    )

def store_chunks(chunks, embeddings, video_id):
    points = []

    for idx, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    ):
        points.append(
            PointStruct(
                id=abs(hash(f"{video_id}_{idx}")) % 1000000000,
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

def search_chunks(query_embedding, limit=3):
    return client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding.tolist(),
        limit=limit
    )