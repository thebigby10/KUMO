# app/main.py
from fastapi import FastAPI, File, HTTPException, UploadFile

from .storage import s3_service

app = FastAPI()


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # The service now returns the UUID filename (e.g., "550e8400-e29b.png")
        unique_name = s3_service.upload_file(
            file.file, file.filename, file.content_type
        )
        return {"id": unique_name, "original_name": file.filename, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{file_id}")
async def get_file_url(file_id: str):
    try:
        # Use the UUID name to generate the link
        url = s3_service.get_presigned_url(file_id)
        return {"download_url": url}
    except Exception as e:
        # MinIO will throw an error if the object doesn't exist
        raise HTTPException(status_code=404, detail="File not found")
