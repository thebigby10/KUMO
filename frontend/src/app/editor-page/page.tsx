// src/app/editor-page/page.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Play, Activity, ChevronDown } from "lucide-react";
import Editor from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";

// --- Types ---
type LanguageKey = "cpp" | "c" | "java" | "python";
type ServiceStatus = "checking" | "online" | "offline" | "down";

interface Task {
  id: string;
  title: string;
  description?: string;
  initialCode?: string;
  initialLanguage?: string;
}

interface CodeEditorPageProps {
  tasks: Task[];
  workId?: string;
}

const LANGUAGES = [
  { key: "python" as LanguageKey, label: "Python" },
  // { key: "cpp" as LanguageKey, label: "C++" },
  // { key: "c" as LanguageKey, label: "C" },
  // { key: "java" as LanguageKey, label: "Java" },
];

const CodeEditorPage = ({ tasks, workId }: CodeEditorPageProps) => {
  // Normalize DB language to our types
  const normalizeLang = (lang: string): LanguageKey => {
    if (lang === "c" || lang === "cpp" || lang === "java" || lang === "python")
      return lang;
    return "python"; // Default fallback
  };

  // Task Management State
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const activeTask = tasks[activeTaskIndex];

  // Task-specific state stored per task
  const [taskStates, setTaskStates] = useState(() =>
    tasks.map((task) => ({
      code: task.initialCode || "",
      language: normalizeLang(task.initialLanguage || "python"),
      input: "",
      output: "",
    })),
  );

  // Current task state
  const currentTaskState = taskStates[activeTaskIndex];

  // Global UI State
  const [status, setStatus] = useState<ServiceStatus>("checking");
  const [isRunning, setIsRunning] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // UI & Layout State
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    undefined,
  );
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256);
  const [inputWidth, setInputWidth] = useState(50);

  // Update task state helper
  const updateCurrentTaskState = (
    updates: Partial<typeof currentTaskState>,
  ) => {
    setTaskStates((prev) =>
      prev.map((state, idx) =>
        idx === activeTaskIndex ? { ...state, ...updates } : state,
      ),
    );
  };

  // --- 1. Service Health Check ---
  useEffect(() => {
    const checkStatus = async () => {
      setStatus("checking");
      try {
        const healthResponse = await fetch("/api/code-execution/health");
        const data = await healthResponse.json();
        console.log(data);
        setStatus(data.status === "online" ? "online" : "offline");
      } catch {
        setStatus("down");
      }
    };
    checkStatus();
  }, [currentTaskState.language]);

  // --- 2. Code Execution Handler ---
  const handleRun = async () => {
    if (status === "down") return;

    setIsRunning(true);
    updateCurrentTaskState({ output: "Executing code..." });

    try {
      const response = await fetch("/api/code-execution/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: currentTaskState.language,
          sourceCode: currentTaskState.code,
          stdin: currentTaskState.input,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        let outputText =
          data.output || data.stdout || "Program finished (no output).";
        if (data.stderr) {
          outputText += "\n" + data.stderr;
        }
        updateCurrentTaskState({ output: outputText });
      } else {
        updateCurrentTaskState({
          output: `Error: ${data.error || data.message || "Execution failed"}`,
        });
      }
    } catch (err) {
      updateCurrentTaskState({
        output:
          "Error: Could not connect to execution server. Check if containers are running.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // --- 3. UI Resizing Logic ---
  const startResizing = useCallback(
    (
      type: "vertical" | "horizontal" | "input",
      startEvent: React.MouseEvent,
    ) => {
      startEvent.preventDefault();
      setIsDragging(true);
      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      const startLeftWidth = leftPanelWidth ?? window.innerWidth / 2;
      const startBottomHeight = bottomPanelHeight;
      const containerRect =
        type === "input"
          ? startEvent.currentTarget.parentElement?.getBoundingClientRect()
          : null;

      const handleMouseMove = (e: MouseEvent) => {
        if (type === "vertical") {
          const newHeight = startBottomHeight + (startY - e.clientY);
          if (newHeight >= 100 && newHeight <= window.innerHeight - 150)
            setBottomPanelHeight(newHeight);
        } else if (type === "horizontal") {
          const newWidth = startLeftWidth + (e.clientX - startX);
          if (newWidth >= 200 && newWidth <= window.innerWidth - 200)
            setLeftPanelWidth(newWidth);
        } else if (type === "input" && containerRect) {
          const newWidthPercent =
            ((e.clientX - containerRect.left) / containerRect.width) * 100;
          if (newWidthPercent >= 10 && newWidthPercent <= 90)
            setInputWidth(newWidthPercent);
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
      document.body.style.cursor =
        type === "vertical" ? "ns-resize" : "ew-resize";
    },
    [bottomPanelHeight, leftPanelWidth],
  );

  return (
    <div
      className={`flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a] ${isDragging ? "select-none" : ""}`}
    >
      {/* LEFT PANEL: Description */}
      <div
        className="flex flex-col"
        style={{ width: leftPanelWidth ?? "calc(50% - 4px)" }}
      >
        <PanelContainer className="h-full">
          <PanelHeader>
            {/* Task Tabs */}
            <div className="flex gap-2">
              {tasks.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTaskIndex(index)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-t transition-colors ${
                    activeTaskIndex === index
                      ? "bg-[#262626] text-green-500 border-b-2 border-green-500"
                      : "bg-[#1a1a1a] text-gray-400 hover:text-gray-200 hover:bg-[#222]"
                  }`}
                >
                  Task {index + 1}
                </button>
              ))}
            </div>
          </PanelHeader>
          <div className="flex items-center gap-2 p-5 bg-[#262626]">
            <span className="text-sm font-medium">{activeTask.title}</span>
          </div>
          <hr className="border-gray-600" />
          <div className="flex-1 bg-[#262626] p-6 overflow-y-auto whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
            {activeTask.description || "No description provided."}
          </div>
        </PanelContainer>
      </div>

      <ResizeHandle
        direction="horizontal"
        onMouseDown={(e) => startResizing("horizontal", e)}
      />

      {/* RIGHT PANEL: Code & Terminal */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">
        <PanelContainer
          style={{ height: `calc(100vh - ${bottomPanelHeight}px - 24px)` }}
        >
          <PanelHeader>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-green-500">
                &lt;/&gt; Code
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#333] text-[10px] font-bold">
                <div
                  className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-gray-400 uppercase">{status}</span>
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase text-gray-300 bg-[#333] border border-gray-600 rounded hover:bg-[#3a3a3a] transition-colors"
                >
                  {
                    LANGUAGES.find((l) => l.key === currentTaskState.language)
                      ?.label
                  }
                  <ChevronDown size={14} />
                </button>

                {showLangDropdown && (
                  <div className="absolute top-full mt-1 left-0 bg-[#2a2a2a] border border-gray-600 rounded shadow-lg z-10 min-w-[120px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.key}
                        onClick={() => {
                          updateCurrentTaskState({ language: lang.key });
                          setShowLangDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[#3a3a3a] transition-colors ${
                          currentTaskState.language === lang.key
                            ? "bg-[#3a3a3a] text-green-500"
                            : "text-gray-300"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PanelHeader>
          <Editor
            height="100%"
            language={
              currentTaskState.language === "c" ||
              currentTaskState.language === "cpp"
                ? "cpp"
                : currentTaskState.language
            }
            value={currentTaskState.code}
            theme="vs-dark"
            onChange={(v) => updateCurrentTaskState({ code: v || "" })}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 14,
            }}
          />
        </PanelContainer>

        <ResizeHandle
          direction="vertical"
          onMouseDown={(e) => startResizing("vertical", e)}
        />

        <PanelContainer style={{ height: `${bottomPanelHeight}px` }}>
          <PanelHeader>
            <div className="text-sm font-medium text-white border-b-2 border-green-500 px-2 pb-1">
              Console
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1 rounded text-sm font-medium ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-[#2cbb5d] hover:bg-[#26a351]"}`}
            >
              {isRunning ? (
                <Activity size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}{" "}
              {isRunning ? "Running" : "Run"}
            </button>
          </PanelHeader>
          <div className="flex flex-1 gap-1 p-2 overflow-hidden bg-[#262626]">
            <textarea
              value={currentTaskState.input}
              onChange={(e) =>
                updateCurrentTaskState({ input: e.target.value })
              }
              className="p-3 font-mono text-sm text-gray-300 bg-[#1a1a1a] border border-[#444] rounded outline-none resize-none"
              style={{ width: `${inputWidth}%` }}
              placeholder="Stdin..."
            />
            <div
              onMouseDown={(e) => startResizing("input", e)}
              className="w-1 cursor-ew-resize hover:bg-blue-500/20"
            />
            <pre className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#1e1e1e] border border-[#444] rounded overflow-auto">
              {currentTaskState.output || "Run code to see output..."}
            </pre>
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default CodeEditorPage;
