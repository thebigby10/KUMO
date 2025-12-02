import React, { useState, useEffect } from "react";

export default function HomePage() {
  const [ipcMessage, setIpcMessage] = useState("");
  const [code, setCode] = useState(`function solution(input) {
  // Write your code here...
  console.log("Processing: " + input);
  return true;
}`);
  const [inputData, setInputData] = useState("1 2 3 4 5");
  const [outputData, setOutputData] = useState("");
  const [activeTab, setActiveTab] = useState("output"); // 'input' or 'output' for mobile/tab switching if needed

  // IPC Logic
  const sendPing = () => {
    if (typeof window !== "undefined" && window.ipc) {
      window.ipc.send("ping", "Run Command Initiated");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ipc) {
      // ipc.on forwards unknown[] from preload; normalize the first arg to a string
      window.ipc.on("pong", (...args: unknown[]) => {
        const first = args[0];
        if (typeof first === "string") {
          setIpcMessage(first);
        } else if (first === undefined) {
          setIpcMessage("");
        } else {
          try {
            setIpcMessage(JSON.stringify(first));
          } catch {
            setIpcMessage(String(first));
          }
        }
      });
    }
  }, []);

  // Handlers
  const handleRun = () => {
    setActiveTab("output");
    setOutputData(
      "> Compiling...\n> Running main.js...\n> Hello World\n> Process finished with exit code 0",
    );
    sendPing();
  };

  const handleTest = () => {
    setActiveTab("output");
    setOutputData(
      "> Running Test Suite...\n> Test 1: Passed [10ms]\n> Test 2: Passed [12ms]\n> Test 3: Failed (Expected 5, got 4)",
    );
  };

  const handleSubmit = () => {
    setActiveTab("output");
    setOutputData(
      "> Submitting to server...\n> 🚀 Submission Accepted!\n> Runtime: 45ms\n> Memory: 24MB",
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* --- LEFT PANEL: EDITOR --- */}
      <div className="flex flex-col w-7/12 border-r border-white/10">
        {/* Editor Header */}
        <div className="h-12 bg-[#09090b] border-b border-white/10 flex items-center px-4 justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-400 rounded bg-blue-600/20">
              JS
            </span>
            <span className="text-sm font-medium text-zinc-100">
              solution.js
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div
              className={`w-2 h-2 rounded-full ${ipcMessage ? "bg-green-500" : "bg-zinc-700"}`}
            ></div>
            {ipcMessage ? "Connected" : "Offline"}
          </div>
        </div>

        {/* Editor Body */}
        <div className="relative flex-1 group">
          {/* Line Numbers (Visual only for this demo) */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#09090b] border-r border-white/5 flex flex-col items-end pt-4 pr-3 text-zinc-600 font-mono text-sm select-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-[#0c0c0e] pl-16 pr-4 pt-4 text-sm font-mono leading-6 text-zinc-100 resize-none focus:outline-none"
            spellCheck="false"
          />
        </div>
      </div>

      {/* --- RIGHT PANEL: I/O & CONTROLS --- */}
      <div className="w-5/12 flex flex-col bg-[#0c0c0e]">
        {/* Input Section */}
        <div className="flex flex-col flex-1 min-h-0 border-b border-white/10">
          <div className="h-10 bg-[#09090b] border-b border-white/10 flex items-center px-4 justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500">
              Standard Input
            </span>
          </div>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm text-gray-400 bg-transparent resize-none focus:outline-none placeholder-zinc-700"
            placeholder="Enter input data here..."
          />
        </div>

        {/* Output Section */}
        <div className="relative flex flex-col flex-1 min-h-0">
          <div className="h-10 bg-[#09090b] border-b border-white/10 flex items-center px-4 justify-between border-t">
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500">
              Console Output
            </span>
            <button
              onClick={() => setOutputData("")}
              className="text-xs transition text-zinc-600 hover:text-zinc-400"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 w-full bg-[#09090b] p-4 font-mono text-sm overflow-y-auto">
            {outputData ? (
              <pre className="whitespace-pre-wrap text-green-400/90">
                {outputData}
              </pre>
            ) : (
              <span className="italic text-zinc-700">
                Run code to see output...
              </span>
            )}
          </div>
        </div>

        {/* --- BOTTOM ACTION BAR --- */}
        <div className="h-16 bg-[#09090b] border-t border-white/10 flex items-center justify-between px-6">
          <div className="text-xs text-zinc-600">Ready to submit</div>

          <div className="flex items-center gap-3">
            {/* Run Button */}
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 transition-all border rounded-md group bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 border-white/5"
            >
              <svg
                className="w-4 h-4 transition-colors text-zinc-400 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Run</span>
            </button>

            {/* Test Button */}
            <button
              onClick={handleTest}
              className="flex items-center gap-2 px-4 py-2 transition-all border rounded-md group bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 border-white/5"
            >
              <svg
                className="w-4 h-4 transition-colors text-yellow-500/80 group-hover:text-yellow-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Test</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 text-white transition-all bg-blue-600 rounded-md shadow-lg hover:bg-blue-500 shadow-blue-500/20 active:scale-95"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path>
              </svg>
              <span className="text-sm font-semibold">Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
