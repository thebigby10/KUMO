"""
PDF Processor — Downloads a PDF from a URL and extracts chunked text.

Uses PyMuPDF for text extraction and LangChain's RecursiveCharacterTextSplitter
for intelligent chunking with overlap.
"""

import io
import logging

import fitz  # PyMuPDF
import httpx
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import settings

logger = logging.getLogger(__name__)


async def download_pdf(pdf_url: str) -> bytes:
    """Download a PDF from a URL and return raw bytes."""
    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        response = await client.get(pdf_url)
        response.raise_for_status()
        return response.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append(f"[Page {page_num + 1}]\n{text.strip()}")
    doc.close()

    full_text = "\n\n".join(pages)
    if not full_text.strip():
        raise ValueError("PDF contains no extractable text (may be scanned/image-based)")

    logger.info(f"Extracted {len(full_text)} characters from {len(pages)} pages")
    return full_text


def chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    chunks = splitter.split_text(text)
    logger.info(f"Split text into {len(chunks)} chunks (size={settings.CHUNK_SIZE}, overlap={settings.CHUNK_OVERLAP})")
    return chunks


async def process_pdf(pdf_url: str) -> list[str]:
    """Full pipeline: download PDF → extract text → chunk into pieces."""
    logger.info(f"Downloading PDF from: {pdf_url}")
    pdf_bytes = await download_pdf(pdf_url)

    logger.info("Extracting text from PDF...")
    full_text = extract_text_from_pdf(pdf_bytes)

    logger.info("Chunking text...")
    chunks = chunk_text(full_text)

    return chunks
