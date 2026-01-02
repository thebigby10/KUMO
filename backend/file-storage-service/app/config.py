# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MinIO Settings
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_PUBLIC_URL: str = "http://localhost:9000"
    MINIO_ACCESS_KEY: str = "admin"
    MINIO_SECRET_KEY: str = "password123"
    MINIO_BUCKET_NAME: str = "kumo-bucket"
    MINIO_SECURE: bool = False

    # App Settings
    PROJECT_NAME: str = "file-storage-service"

    # This will load variables from a .env file if it exists
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
