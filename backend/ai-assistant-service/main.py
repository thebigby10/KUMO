import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pdf_processor import process_pdf
from vector_store import store_chunks, delete_task_data, has_task_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="KUMO AI Assistant Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request Models ---


class IngestRequest(BaseModel):
    task_id: str
    pdf_url: str


# --- Endpoints ---


@app.get("/")
async def health_check():
    return {"status": "online", "service": "ai-assistant"}


@app.post("/ingest")
async def ingest_pdf(req: IngestRequest):
    """Download a PDF, extract text, chunk it, embed it, and store in vector DB.

    Called when a teacher creates or updates a work/task with a PDF URL.
    If the task already has ingested data, it is replaced (clean re-ingestion).
    """
    try:
        # 1. Download + extract + chunk
        chunks = await process_pdf(req.pdf_url)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF",
            )

        # 2. Embed + store in ChromaDB
        num_stored = store_chunks(req.task_id, chunks)

        return {
            "status": "success",
            "task_id": req.task_id,
            "chunks_stored": num_stored,
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Ingestion failed for task {req.task_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ingest PDF: {str(e)}",
        )


@app.delete("/task/{task_id}")
async def delete_task(task_id: str):
    """Delete all stored PDF data for a task (called when a task is deleted)."""
    deleted = delete_task_data(task_id)
    return {
        "status": "deleted" if deleted else "not_found",
        "task_id": task_id,
    }


@app.get("/task/{task_id}/status")
async def task_status(task_id: str):
    """Check if a task has ingested PDF data available for querying."""
    return {
        "task_id": task_id,
        "has_data": has_task_data(task_id),
    }
