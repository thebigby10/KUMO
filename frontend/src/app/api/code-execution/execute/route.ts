import { NextResponse } from 'next/server';

const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute';

interface ExecutionRequest {
  language: string;
  sourceCode: string;
  stdin?: string;
}

export async function POST(request: Request) {
  try {
    const body: ExecutionRequest = await request.json();
    const { language, sourceCode, stdin } = body;

    // Basic validation
    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: 'Language and sourceCode are required fields.' },
        { status: 400 }
      );
    }

    const pistonPayload = {
      language: language,
      version: "*", // Piston uses the latest installed version by default
      files: [
        {
          content: sourceCode,
        },
      ],
      stdin: stdin || "",
    };

    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pistonPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Piston Engine Error', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Mapping the Piston response to a cleaner format for Kumo
    return NextResponse.json({
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code,
      signal: result.run.signal,
      output: result.run.output, // Combined stdout and stderr
    });

  } catch (error) {
    console.error('Execution API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}