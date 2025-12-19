import { NextResponse } from 'next/server';

// Configuration for your Piston instance
const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute';

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
  const lang = searchParams.get('lang') || 'python';

  if (!TEST_SNIPPETS[lang]) {
    return NextResponse.json(
      { error: `Language '${lang}' is not supported for health checks.` },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();

    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang,
        version: '*',
        files: [{ content: TEST_SNIPPETS[lang] }],
      }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Check if Piston returned a successful execution output
    if (response.ok && data.run && data.run.stdout.trim() === 'ok') {
      return NextResponse.json({
        status: 'online',
        language: lang,
        latency: `${duration}ms`,
        output: data.run.stdout.trim(),
      });
    }

    return NextResponse.json(
      { 
        status: 'offline', 
        error: 'Execution failed or incorrect output', 
        details: data 
      },
      { status: 502 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'down', 
        error: 'Could not connect to Piston engine', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    );
  }
}