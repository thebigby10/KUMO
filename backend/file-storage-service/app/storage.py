# app/storage.py
import json
import os
import uuid
from datetime import timedelta

from minio import Minio

from .config import settings


class MinioClient:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._create_bucket_if_not_exists()
        self._set_public_policy()

    def _create_bucket_if_not_exists(self):
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)

    def _set_public_policy(self):
        # This policy allows "ReadOnly" access to everyone
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                    "Resource": [f"arn:aws:s3:::{self.bucket_name}"],
                },
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"],
                },
            ],
        }
        self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))

    def upload_file(self, file_data, original_filename, content_type):
        # 1. Extract extension (e.g., .jpg)
        ext = os.path.splitext(original_filename)[1]

        # 2. Generate a unique UUID filename
        unique_filename = f"{uuid.uuid4()}{ext}"

        # 3. Upload to MinIO
        self.client.put_object(
            self.bucket_name,
            unique_filename,
            file_data,
            length=-1,
            part_size=10 * 1024 * 1024,
            content_type=content_type,
        )
        return unique_filename

    def get_presigned_url(self, file_uuid_name):
        return f"{settings.MINIO_PUBLIC_URL}/{self.bucket_name}/{file_uuid_name}"


s3_service = MinioClient()
