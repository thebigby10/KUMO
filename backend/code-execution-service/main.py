import os

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Piston Execution API")

# Internal URL where the Piston container is listening
PISTON_URL = os.getenv("PISTON_URL", "http://piston:2000")


class ExecuteRequest(BaseModel):
    language: str
    version: str = "*"  # Default to latest available
    code: str
    stdin: str = ""
    args: list[str] = []


@app.get("/")
async def health_check():
    return {"status": "online", "engine": "piston"}


@app.get("/runtimes")
async def get_runtimes():
    """List available languages installed in Piston"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{PISTON_URL}/api/v2/runtimes")
            return resp.json()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Piston engine unavailable")


@app.post("/execute")
async def execute_code(req: ExecuteRequest):
    """Execute code via Piston"""
    payload = {
        "language": req.language,
        "version": req.version,
        "files": [{"content": req.code}],
        "stdin": req.stdin,
        "args": req.args,
        "compile_timeout": 10000,
        "run_timeout": 3000,
        "run_memory_limit": -1,
    }

    async with httpx.AsyncClient() as client:
        try:
            # Piston API endpoint
            resp = await client.post(f"{PISTON_URL}/api/v2/execute", json=payload)

            if resp.status_code == 400:
                return (
                    resp.json()
                )  # Return Piston error messages (e.g. language not supported)

            resp.raise_for_status()
            return resp.json()

        except httpx.RequestError:
            raise HTTPException(
                status_code=503, detail="Failed to connect to execution engine"
            )
