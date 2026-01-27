import { NextResponse } from "next/server";

// Ensure the URL points to the execute endpoint
const PISTON_URL = process.env.PISTON_URL || "http://localhost:8001/execute";

interface ExecutionRequest {
  language: string;
  sourceCode: string;
  stdin?: string;
  args?: string[];
}

export async function POST(request: Request) {
  try {
    const body: ExecutionRequest = await request.json();
    const { language, sourceCode, stdin, args } = body;

    // Basic validation
    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: "Language and sourceCode are required fields." },
        { status: 400 },
      );
    }

    // UPDATED: Payload matching your specific Piston instance structure
    const pistonPayload = {
      language: language,
      version: "*",
      source_code: sourceCode, // Using flat 'source_code' instead of 'files'
      stdin: stdin || "",
      args: args || [],
    };

    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pistonPayload),
    });

    // Handle non-200 responses from Piston
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }

      return NextResponse.json(
        { error: "Piston Engine Error", details: errorData },
        { status: response.status },
      );
    }

    const result = await response.json();

    // Mapping the Piston response
    // Note: If your Piston version returns a flat 'output' instead of 'run.stdout',
    // you may need to adjust the mapping below. This assumes standard V2 response format.
    return NextResponse.json({
      stdout: result.run?.stdout || result.output || "",
      stderr: result.run?.stderr || "",
      code: result.run?.code || 0,
      signal: result.run?.signal || null,
      output: result.run?.output || result.output || "",
    });
  } catch (error) {
    console.error("Execution API Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
