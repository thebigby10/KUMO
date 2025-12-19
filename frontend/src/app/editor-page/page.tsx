"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Play, Download, Settings, Maximize2, FileText, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";

// --- Types ---
type LanguageKey = "cpp" | "c" | "java" | "python";
type ServiceStatus = "checking" | "online" | "offline" | "down";

// --- Constants ---
const LANGUAGE_TEMPLATES: Record<LanguageKey, string> = {
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  python: `print("Hello from Python!")`
};

const CodeEditorPage = () => {
  // Logic & Execution State
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES["cpp"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [pdfUrl] = useState(""); 
  const [status, setStatus] = useState<ServiceStatus>("checking");
  const [isRunning, setIsRunning] = useState(false);
  
  // UI & Layout State
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(undefined);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256);
  const [inputWidth, setInputWidth] = useState(50);

  // --- 1. Service Health Check ---
  useEffect(() => {
    const checkStatus = async () => {
      setStatus("checking");
      try {
        const res = await fetch(`/api/code-exection/health?lang=${language}`);
        const data = await res.json();
        if (res.ok && data.status === 'online') setStatus("online");
        else setStatus("offline");
      } catch {
        setStatus("down");
      }
    };
    checkStatus();
  }, [language]);

  // --- 2. Code Execution Handler ---
  const handleRun = async () => {
    if (status !== "online") return;
    setIsRunning(true);
    setOutput("Executing code...");

    try {
      const response = await fetch("/api/code-exection/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, sourceCode: code, stdin: input }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output || "Program finished (no output).");
      } else {
        setOutput(`Error: ${data.error}\n${data.details?.message || ""}`);
      }
    } catch {
      setOutput("Error: Could not connect to execution server.");
    } finally {
      setIsRunning(false);
    }
  };

  // --- 3. UI Resizing Logic ---
  const startResizing = useCallback(
    (type: "vertical" | "horizontal" | "input", startEvent: React.MouseEvent) => {
      startEvent.preventDefault();
      setIsDragging(true);
      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      const startLeftWidth = leftPanelWidth ?? window.innerWidth / 2;
      const startBottomHeight = bottomPanelHeight;
      const containerRect = type === "input" ? (startEvent.currentTarget.parentElement?.getBoundingClientRect()) : null;

      const handleMouseMove = (e: MouseEvent) => {
        if (type === "vertical") {
          const newHeight = startBottomHeight + (startY - e.clientY);
          if (newHeight >= 100 && newHeight <= window.innerHeight - 150) setBottomPanelHeight(newHeight);
        } else if (type === "horizontal") {
          const newWidth = startLeftWidth + (e.clientX - startX);
          if (newWidth >= 200 && newWidth <= window.innerWidth - 200) setLeftPanelWidth(newWidth);
        } else if (type === "input" && containerRect) {
          const newWidthPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;
          if (newWidthPercent >= 10 && newWidthPercent <= 90) setInputWidth(newWidthPercent);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = type === "vertical" ? "ns-resize" : "ew-resize";
    },
    [bottomPanelHeight, leftPanelWidth]
  );

  const handleLanguageChange = (lang: string) => {
    const l = lang as LanguageKey;
    setLanguage(l);
    setCode(LANGUAGE_TEMPLATES[l]);
  };

  return (
    <div className="flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a]">
      {/* LEFT PANEL */}
      <div className="flex flex-col" style={{ width: leftPanelWidth ?? "calc(50% - 4px)" }}>
        <PanelContainer className="h-full">
          <PanelHeader>
            <div className="flex items-center gap-2"><FileText size={16} className="text-blue-500"/><span className="text-sm font-medium">Description</span></div>
          </PanelHeader>
          <div className="flex-1 bg-[#262626] flex items-center justify-center text-gray-500 italic">PDF content for Kumo goes here...</div>
        </PanelContainer>
      </div>

      <ResizeHandle direction="horizontal" onMouseDown={(e) => startResizing("horizontal", e)} />

      {/* RIGHT PANEL */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">
        <PanelContainer style={{ height: `calc(100vh - ${bottomPanelHeight}px - 24px)` }}>
          <PanelHeader>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-green-500">&lt;/&gt; Code</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#333] text-[10px] font-bold">
                <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-gray-400 uppercase">{status}</span>
              </div>
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-transparent text-xs outline-none">
                <option value="cpp">C++</option><option value="c">C</option><option value="java">Java</option><option value="python">Python</option>
              </select>
            </div>
          </PanelHeader>
          <Editor height="100%" language={language} value={code} theme="vs-dark" onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, automaticLayout: true }} />
        </PanelContainer>

        <ResizeHandle direction="vertical" onMouseDown={(e) => startResizing("vertical", e)} />

        <PanelContainer style={{ height: `${bottomPanelHeight}px` }}>
          <PanelHeader>
            <div className="text-sm font-medium text-white border-b-2 border-green-500 px-2 pb-1">Console</div>
            <button onClick={handleRun} disabled={isRunning || status !== "online"} className={`flex items-center gap-2 px-4 py-1 rounded text-sm font-medium ${isRunning || status !== "online" ? "bg-gray-600 cursor-not-allowed" : "bg-[#2cbb5d] hover:bg-[#26a351]"}`}>
              {isRunning ? <Activity size={14} className="animate-spin" /> : <Play size={14} />} {isRunning ? "Running" : "Run"}
            </button>
          </PanelHeader>
          <div className="flex flex-1 gap-1 p-2 overflow-hidden bg-[#262626]">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="p-3 font-mono text-sm text-gray-300 bg-[#1a1a1a] border border-[#444] rounded outline-none resize-none" style={{ width: `${inputWidth}%` }} placeholder="Stdin..." />
            <div onMouseDown={(e) => startResizing("input", e)} className="w-1 cursor-ew-resize hover:bg-blue-500/20" />
            <pre className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#1e1e1e] border border-[#444] rounded overflow-auto">{output || "Run code to see output..."}</pre>
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default CodeEditorPage;