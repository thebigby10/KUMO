"""
LLM Module — Google Gemini integration with guard-railed system prompt.

Uses Gemini 2.0 Flash (free tier: 15 RPM, 1M tokens/day) to answer
student questions strictly from PDF context while refusing to solve
the actual assignment tasks directly.
"""

import asyncio
import logging

import google.generativeai as genai

from config import settings

logger = logging.getLogger(__name__)

_gemini_configured = False


def _ensure_configured():
    """Configure Gemini API key lazily (only when actually needed)."""
    global _gemini_configured
    if not _gemini_configured and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_configured = True

SYSTEM_PROMPT = """\
You are KUMO AI, a helpful teaching assistant for a university coding lab platform.

YOUR PURPOSE:
You help students understand the reference material (PDF lecture notes, documentation, etc.) \
uploaded by their instructor. You answer questions ONLY based on the provided reference material chunks.

STRICT RULES YOU MUST FOLLOW:
1. ONLY answer based on the REFERENCE MATERIAL chunks provided below. Do NOT use outside knowledge.
2. If the answer is NOT in the reference material, respond: \
"I couldn't find information about that in the uploaded reference material."
3. You are given the TASK/ASSIGNMENT DESCRIPTION below. You must NEVER:
   - Directly solve the assignment task or write the solution code
   - Provide step-by-step solutions to the task problems
   - Give code that directly answers what the task is asking
   - Debug or fix the student's submission code for the task
4. You MAY:
   - Explain concepts and terminology from the reference material
   - Clarify theory, definitions, and examples found in the PDF
   - Point students to relevant sections of the reference material
   - Give general conceptual guidance based on the reference material
   - Explain syntax or language features mentioned in the reference material
5. If the student asks you to "write the code", "solve the problem", "give the answer", \
or anything that would directly complete the assignment task, politely refuse and redirect them \
to the reference material.
6. Keep answers concise and educational. Use markdown formatting where helpful.
7. If the student greets you or asks who you are, briefly introduce yourself and tell them \
you can help them understand the reference material.

===== TASK/ASSIGNMENT DESCRIPTION (DO NOT SOLVE THIS — THIS IS WHAT THE STUDENT MUST DO THEMSELVES) =====
{task_description}

===== REFERENCE MATERIAL (ANSWER BASED ON THIS) =====
{context_chunks}

===== CONVERSATION HISTORY =====
{chat_history}
"""


def _format_chat_history(history: list[dict]) -> str:
    """Format chat history into a readable string for the prompt."""
    if not history:
        return "(No previous messages)"

    formatted = []
    for msg in history[-6:]:  # Keep last 6 messages (3 exchanges) for context
        role = "Student" if msg.get("role") == "user" else "KUMO AI"
        formatted.append(f"{role}: {msg.get('content', '')}")
    return "\n".join(formatted)


async def generate_answer(
    question: str,
    context_chunks: list[str],
    task_title: str = "",
    task_description: str = "",
    chat_history: list[dict] | None = None,
) -> str:
    """Generate a guard-railed answer using Gemini.

    Args:
        question: The student's question
        context_chunks: Relevant PDF chunks retrieved from vector store
        task_title: The assignment task title (used to detect direct-answer requests)
        task_description: The assignment task description (injected so LLM knows what NOT to solve)
        chat_history: Previous messages in the conversation [{role, content}, ...]

    Returns:
        The AI-generated answer string
    """
    if not settings.GEMINI_API_KEY:
        return "AI assistant is not configured. Please ask your instructor to set up the GEMINI_API_KEY."

    _ensure_configured()

    # Build the full task description for the guard rail
    full_task_desc = ""
    if task_title:
        full_task_desc += f"Task Title: {task_title}\n"
    if task_description:
        full_task_desc += f"Task Description: {task_description}\n"
    if not full_task_desc:
        full_task_desc = "(No task description provided)"

    # Format context chunks with numbering
    if context_chunks:
        formatted_context = "\n\n".join(
            f"[Chunk {i + 1}]\n{chunk}" for i, chunk in enumerate(context_chunks)
        )
    else:
        formatted_context = "(No reference material available for this task)"

    # Format chat history
    history_str = _format_chat_history(chat_history or [])

    # Build the full prompt
    full_prompt = SYSTEM_PROMPT.format(
        task_description=full_task_desc,
        context_chunks=formatted_context,
        chat_history=history_str,
    )

    try:
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=full_prompt,
        )

        # Run synchronous Gemini SDK call in a thread to avoid blocking the event loop
        response = await asyncio.to_thread(
            model.generate_content,
            question,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,  # Low temperature for factual answers
                max_output_tokens=1024,
            ),
        )

        if response.text:
            return response.text.strip()
        else:
            logger.warning("Gemini returned empty response")
            return "I'm sorry, I couldn't generate a response. Please try rephrasing your question."

    except Exception as e:
        logger.error(f"Gemini API error: {e}", exc_info=True)

        error_str = str(e).lower()
        if "quota" in error_str or "rate" in error_str:
            return "The AI assistant has reached its rate limit. Please wait a moment and try again."
        elif "api_key" in error_str or "authentication" in error_str:
            return "AI assistant is not properly configured. Please contact your instructor."

        return "An error occurred while generating a response. Please try again."
