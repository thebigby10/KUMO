import { NextResponse } from "next/server";

const AI_ASSISTANT_URL =
  process.env.AI_ASSISTANT_URL || "http://localhost:8003";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, pdfUrl } = body;

    if (!taskId || !pdfUrl) {
      return NextResponse.json(
        { error: "taskId and pdfUrl are required." },
        { status: 400 },
      );
    }

    const response = await fetch(`${AI_ASSISTANT_URL}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        pdf_url: pdfUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI ingestion failed:", errorData);
      // Don't fail the whole operation — ingestion is best-effort
      return NextResponse.json(
        { error: "Ingestion failed", details: errorData },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Assistant ingest error:", error);
    // Don't fail — ingestion is non-critical
    return NextResponse.json(
      { error: "Failed to contact AI assistant for ingestion" },
      { status: 500 },
    );
  }
}
