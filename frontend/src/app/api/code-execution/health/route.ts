import { NextResponse } from "next/server";

// Configuration for your Piston instance
const PISTON_URL = process.env.PISTON_URL || "http://localhost:8001/execute";

// Define the structure of the execution request
const TEST_SNIPPETS: Record<string, string> = {
  python: 'print("ok")',
  javascript: 'console.log("ok")',
  cpp: '#include <iostream>\nint main() { std::cout << "ok"; return 0; }',
  c: '#include <stdio.h>\nint main() { printf("ok"); return 0; }',
  java: 'public class Main { public static void main(String[] args) { System.out.print("ok"); } }',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "python";

  if (!TEST_SNIPPETS[lang]) {
    return NextResponse.json(
      { error: `Language '${lang}' is not supported for health checks.` },
      { status: 400 },
    );
  }

  try {
    const startTime = Date.now();

    // --- UPDATED PAYLOAD HERE ---
    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: "*",
        source_code: TEST_SNIPPETS[lang], // Changed from 'files' array to 'source_code' string
        stdin: "",
        args: [],
      }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    // IMPORTANT: Verify if the response structure (data.run.stdout) is valid for your version.
    // Some older versions might return 'data.output' directly instead of 'data.run.stdout'.
    // I have kept your original check below, but you may need to adjust it based on the actual response.

    const output = data.run ? data.run.stdout : data.output; // Fallback check

    if (response.ok && output && output.trim() === "ok") {
      return NextResponse.json({
        status: "online",
        language: lang,
        latency: `${duration}ms`,
        output: output.trim(),
      });
    }

    return NextResponse.json(
      {
        status: "offline",
        error: "Execution failed or incorrect output",
        details: data,
      },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "down",
        error: "Could not connect to Piston engine",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
