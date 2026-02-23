import { NextResponse } from "next/server";

const AI_ASSISTANT_URL =
  process.env.AI_ASSISTANT_URL || "http://localhost:8003";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, question, taskTitle, taskDescription, chatHistory } = body;

    if (!taskId || !question) {
      return NextResponse.json(
        { error: "taskId and question are required." },
        { status: 400 },
      );
    }

    const response = await fetch(`${AI_ASSISTANT_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        question,
        task_title: taskTitle || "",
        task_description: taskDescription || "",
        chat_history: chatHistory || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "AI Assistant error", details: errorData },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Assistant ask error:", error);
    return NextResponse.json(
      { error: "Failed to contact AI assistant" },
      { status: 500 },
    );
  }
}
