"""
Vector Store — ChromaDB wrapper for storing and retrieving PDF chunk embeddings.

Each task gets its own ChromaDB collection (named by taskId), so embeddings
are isolated per task and can be independently created/deleted.

Uses sentence-transformers for local, free embeddings on CPU.
"""

import logging

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from config import settings

logger = logging.getLogger(__name__)

# Initialize the embedding model once at module level (loaded at import time)
_embedding_model: SentenceTransformer | None = None


def _get_embedding_model() -> SentenceTransformer:
    """Lazy-load the embedding model (cached after first call)."""
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully")
    return _embedding_model


def _get_chroma_client() -> chromadb.ClientAPI:
    """Get a persistent ChromaDB client."""
    return chromadb.Client(ChromaSettings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=settings.CHROMA_PERSIST_DIR,
        anonymized_telemetry=False,
    ))


# Use a single persistent client
_chroma_client: chromadb.ClientAPI | None = None


def _get_client() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info(f"ChromaDB initialized at {settings.CHROMA_PERSIST_DIR}")
    return _chroma_client


def _collection_name(task_id: str) -> str:
    """Generate a valid ChromaDB collection name from a task ID.
    ChromaDB collection names must be 3-63 chars, start/end with alphanumeric.
    UUIDs like 'a1b2c3d4-...' are valid as-is, but we prefix for clarity.
    """
    # ChromaDB doesn't allow names starting with non-alphanumeric
    # UUIDs are safe, but let's add a prefix for clarity
    name = f"task-{task_id}"
    # Ensure length constraints (UUID = 36 chars + "task-" = 41, well within 63)
    return name[:63]


def store_chunks(task_id: str, chunks: list[str]) -> int:
    """Embed and store text chunks for a given task.

    If the collection already exists for this task, it is deleted and recreated
    (ensures re-ingestion on PDF update is clean).

    Returns the number of chunks stored.
    """
    client = _get_client()
    col_name = _collection_name(task_id)

    # Delete existing collection if it exists (clean re-ingestion)
    try:
        client.delete_collection(col_name)
        logger.info(f"Deleted existing collection: {col_name}")
    except Exception:
        pass  # Collection didn't exist, that's fine

    collection = client.create_collection(
        name=col_name,
        metadata={"task_id": task_id},
    )

    # Generate embeddings
    model = _get_embedding_model()
    embeddings = model.encode(chunks, show_progress_bar=False).tolist()

    # Store in ChromaDB
    ids = [f"{task_id}-chunk-{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"chunk_index": i} for i in range(len(chunks))],
    )

    logger.info(f"Stored {len(chunks)} chunks for task {task_id}")
    return len(chunks)


def retrieve_chunks(task_id: str, query: str, top_k: int | None = None) -> list[str]:
    """Retrieve the most relevant chunks for a query from a task's collection.

    Returns a list of text chunks, ordered by relevance (most relevant first).
    """
    if top_k is None:
        top_k = settings.TOP_K_RESULTS

    client = _get_client()
    col_name = _collection_name(task_id)

    try:
        collection = client.get_collection(col_name)
    except Exception:
        logger.warning(f"No collection found for task {task_id}")
        return []

    # Embed the query
    model = _get_embedding_model()
    query_embedding = model.encode([query], show_progress_bar=False).tolist()

    # Query ChromaDB
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(top_k, collection.count()),
    )

    documents = results.get("documents", [[]])[0]
    logger.info(f"Retrieved {len(documents)} chunks for task {task_id}")
    return documents


def delete_task_data(task_id: str) -> bool:
    """Delete all stored embeddings for a task. Returns True if deleted."""
    client = _get_client()
    col_name = _collection_name(task_id)

    try:
        client.delete_collection(col_name)
        logger.info(f"Deleted collection for task {task_id}")
        return True
    except Exception:
        logger.warning(f"No collection to delete for task {task_id}")
        return False


def has_task_data(task_id: str) -> bool:
    """Check if a task has ingested PDF data."""
    client = _get_client()
    col_name = _collection_name(task_id)

    try:
        collection = client.get_collection(col_name)
        return collection.count() > 0
    except Exception:
        return False
