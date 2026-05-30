from services.embedding_service import model
from services.vector_store import search_chunks

def retrive_context(query):
    query_embedding = model.encode(query)

    results = search_chunks(query_embedding)

    return results
