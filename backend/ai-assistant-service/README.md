# AI Assistant Service

RAG-based AI assistant for KUMO that answers student questions from teacher-uploaded PDFs.

## Stack
- **LLM**: Google Gemini 2.0 Flash (free tier)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (local, free)
- **Vector Store**: ChromaDB (embedded, free)
- **PDF Parsing**: PyMuPDF

## Environment Variables
- `GEMINI_API_KEY` — Google AI Studio API key (get free at https://aistudio.google.com/apikey)

## Endpoints
- `GET /` — Health check
- `POST /ingest` — Ingest a PDF for a task (called when teacher creates/edits work)
- `POST /ask` — Ask a question about a task's PDF
- `DELETE /task/{task_id}` — Clear stored data for a task
