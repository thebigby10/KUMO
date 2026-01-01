# app/storage.py
import json
import os
import uuid
from datetime import timedelta

from minio import Minio


class MinioClient:
    def __init__(self):
        self.client = Minio(
            "localhost:9000", access_key="admin", secret_key="password123", secure=False
        )
        self.bucket_name = "my-microservice-bucket"
        self._create_bucket_if_not_exists()
        self._set_public_policy()  # Add this call

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
        return self.client.presigned_get_object(
            self.bucket_name, file_uuid_name, expires=timedelta(hours=1)
        )


s3_service = MinioClient()
