"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Play, FileText, Activity } from "lucide-react";
import Editor from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";

// --- Types ---
type LanguageKey = "cpp" | "c" | "java" | "python";
type ServiceStatus = "checking" | "online" | "offline" | "down";

interface CodeEditorPageProps {
  initialCode?: string;
  initialLanguage?: string;
  description?: string;
  title?: string;
  workId?: string;
}

const CodeEditorPage = ({ 
  initialCode = "", 
  initialLanguage = "python", 
  description = "No description provided.",
  title = "Lab Work"
}: CodeEditorPageProps) => {

  // Normalize DB language to our types
  const normalizeLang = (lang: string): LanguageKey => {
    if (lang === "c" || lang === "cpp" || lang === "java" || lang === "python") return lang;
    return "python"; // Default fallback
  };

  // Logic & Execution State
  const [language, setLanguage] = useState<LanguageKey>(normalizeLang(initialLanguage));
  const [code, setCode] = useState(initialCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
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
        // Use your existing health check endpoint
        // (Ensure this endpoint exists in your backend, otherwise this might just spin)
        // For now, let's assume if we can reach it, it's good.
        // Or simply set to 'online' if you trust your docker setup.
        setStatus("online"); 
      } catch {
        setStatus("down");
      }
    };
    checkStatus();
  }, [language]);

  // --- 2. Code Execution Handler ---
  const handleRun = async () => {
    // Basic optimistic check
    if (status === "down") return; 
    
    setIsRunning(true);
    setOutput("Executing code...");

    try {
      // Using Next.js API route proxy to avoid CORS issues and work in prod
      const response = await fetch("/api/code-exection/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          language: language, 
          sourceCode: code, // Next.js API route expects camelCase 'sourceCode'
          stdin: input 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output || data.stdout || "Program finished (no output).");
        if (data.stderr) {
          setOutput((prev) => prev + "\n" + data.stderr);
        }
      } else {
        setOutput(`Error: ${data.error || data.message || "Execution failed"}`);
      }
    } catch (err) {
      setOutput("Error: Could not connect to execution server. Check if containers are running.");
    } finally {
      setIsRunning(false);
    }
  };

  // --- 3. UI Resizing Logic (Kept exactly as you wrote it) ---
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

  return (
    <div className={`flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a] ${isDragging ? "select-none" : ""}`}>
      {/* LEFT PANEL: Description */}
      <div className="flex flex-col" style={{ width: leftPanelWidth ?? "calc(50% - 4px)" }}>
        <PanelContainer className="h-full">
          <PanelHeader>
            <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500"/>
                <span className="text-sm font-medium">{title}</span>
            </div>
          </PanelHeader>
          {/* Display DB Description here */}
          <div className="flex-1 bg-[#262626] p-6 overflow-y-auto whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
            {description}
          </div>
        </PanelContainer>
      </div>

      <ResizeHandle direction="horizontal" onMouseDown={(e) => startResizing("horizontal", e)} />

      {/* RIGHT PANEL: Code & Terminal */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">
        <PanelContainer style={{ height: `calc(100vh - ${bottomPanelHeight}px - 24px)` }}>
          <PanelHeader>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-green-500">&lt;/&gt; Code</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#333] text-[10px] font-bold">
                <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-gray-400 uppercase">{status}</span>
              </div>
              <span className="text-xs uppercase text-gray-400 font-bold ml-2 border border-gray-600 px-2 rounded">
                {language}
              </span>
            </div>
          </PanelHeader>
          <Editor 
            height="100%" 
            language={language === "c" || language === "cpp" ? "cpp" : language} 
            value={code} 
            theme="vs-dark" 
            onChange={(v) => setCode(v || "")} 
            options={{ minimap: { enabled: false }, automaticLayout: true, fontSize: 14 }} 
          />
        </PanelContainer>

        <ResizeHandle direction="vertical" onMouseDown={(e) => startResizing("vertical", e)} />

        <PanelContainer style={{ height: `${bottomPanelHeight}px` }}>
          <PanelHeader>
            <div className="text-sm font-medium text-white border-b-2 border-green-500 px-2 pb-1">Console</div>
            <button 
                onClick={handleRun} 
                disabled={isRunning} 
                className={`flex items-center gap-2 px-4 py-1 rounded text-sm font-medium ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-[#2cbb5d] hover:bg-[#26a351]"}`}
            >
              {isRunning ? <Activity size={14} className="animate-spin" /> : <Play size={14} />} {isRunning ? "Running" : "Run"}
            </button>
          </PanelHeader>
          <div className="flex flex-1 gap-1 p-2 overflow-hidden bg-[#262626]">
            <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                className="p-3 font-mono text-sm text-gray-300 bg-[#1a1a1a] border border-[#444] rounded outline-none resize-none" 
                style={{ width: `${inputWidth}%` }} 
                placeholder="Stdin..." 
            />
            <div onMouseDown={(e) => startResizing("input", e)} className="w-1 cursor-ew-resize hover:bg-blue-500/20" />
            <pre className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#1e1e1e] border border-[#444] rounded overflow-auto">
                {output || "Run code to see output..."}
            </pre>
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default CodeEditorPage;