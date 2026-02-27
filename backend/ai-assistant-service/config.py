from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""

    CHROMA_PERSIST_DIR: str = "/app/chroma_data"

    # File storage service URL (to download PDFs)
    FILE_STORAGE_URL: str = "http://file-storage-service:8000"

    # MinIO internal URL (for rewriting localhost PDF URLs inside Docker)
    MINIO_INTERNAL_URL: str = "http://minio:9000"
    MINIO_PUBLIC_URL: str = "http://localhost:9000"

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chunking parameters
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 200

    # Retrieval parameters
    TOP_K_RESULTS: int = 5

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
