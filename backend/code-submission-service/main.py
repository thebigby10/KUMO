from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Code Submission Service")

# CONFIGURATION
# If running locally via Docker Compose, use the service name 'judge0-server'
# If running FastAPI on host and Judge0 in Docker, use 'localhost'
JUDGE0_URL = "http://localhost:2358"

# ---------------------------------------------------------
# 1. Pydantic Models (Data Validation)
# ---------------------------------------------------------


class SubmissionSchema(BaseModel):
    source_code: str
    language_id: int  # e.g., 71 for Python, 54 for C++
    stdin: Optional[str] = None


class SubmissionResponse(BaseModel):
    token: str


# ---------------------------------------------------------
# 2. Helper Function to talk to Judge0
# ---------------------------------------------------------


async def create_judge0_submission(data: dict):
    async with httpx.AsyncClient() as client:
        try:
            # We use wait=false to keep it async.
            # If you want immediate results for short scripts, use wait=true
            response = await client.post(
                f"{JUDGE0_URL}/submissions/?base64_encoded=false&wait=false", json=data
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"Judge0 connection failed: {exc}"
            )


async def get_judge0_result(token: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false"
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"Judge0 connection failed: {exc}"
            )


# ---------------------------------------------------------
# 3. API Endpoints
# ---------------------------------------------------------


@app.post("/submit", response_model=SubmissionResponse)
async def submit_code(payload: SubmissionSchema):
    """
    Receives code, sends it to Judge0, and returns a tracking token.
    """
    judge0_payload = {
        "source_code": payload.source_code,
        "language_id": payload.language_id,
        "stdin": payload.stdin,
    }

    result = await create_judge0_submission(judge0_payload)
    return {"token": result["token"]}


@app.get("/result/{token}")
async def check_result(token: str):
    """
    Client polls this endpoint with the token to check status.
    """
    result = await get_judge0_result(token)

    # Judge0 Status IDs:
    # 1: In Queue, 2: Processing, 3: Accepted,
    # 4: Wrong Answer, 5: Time Limit Exceeded, 6: Compilation Error

    status_id = result["status"]["id"]

    if status_id <= 2:
        return {"status": "Processing", "details": "Code is still running..."}

    return {
        "status": "Finished",
        "verdict": result["status"]["description"],
        "stdout": result.get("stdout"),
        "stderr": result.get("stderr"),
        "time": result.get("time"),
        "memory": result.get("memory"),
    }
