// src/app/editor-page/page.tsx

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Play,
  Activity,
  ChevronDown,
  CloudUpload,
  Maximize,
  AlertTriangle,
  Lock,
} from "lucide-react";
import Editor, { OnMount } from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";
import { submitTaskAction } from "@/actions/submission";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Normalize DB language to our types
  const normalizeLang = (lang: string): LanguageKey => {
    if (lang === "c" || lang === "cpp" || lang === "java" || lang === "python")
      return lang;
    return "python"; // Default fallback
  };

  // --- REFS ---
  const editorRef = useRef<any>(null);
  const internalClipboard = useRef<string>(""); // Stores text copied FROM the editor

  // --- STATE ---
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const activeTask = tasks[activeTaskIndex];

  // Task-specific state
  const [taskStates, setTaskStates] = useState(() =>
    tasks.map((task) => ({
      code: task.initialCode || "",
      language: normalizeLang(task.initialLanguage || "python"),
      input: "",
      output: "",
    })),
  );

  const currentTaskState = taskStates[activeTaskIndex];

  // Global UI State
  const [status, setStatus] = useState<ServiceStatus>("checking");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // KIOSK STATE
  const [isKioskActive, setIsKioskActive] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Layout State
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number | undefined>(
    undefined,
  );
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256);
  const [inputWidth, setInputWidth] = useState(50);

  // Helper to update state
  const updateCurrentTaskState = (
    updates: Partial<typeof currentTaskState>,
  ) => {
    setTaskStates((prev) =>
      prev.map((state, idx) =>
        idx === activeTaskIndex ? { ...state, ...updates } : state,
      ),
    );
  };

  // ---------------------------------------------------------------------------
  // KIOSK MODE LOGIC
  // ---------------------------------------------------------------------------

  const enterKioskMode = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem
        .requestFullscreen()
        .then(() => {
          setIsKioskActive(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
    }
  };

  // 1. Detect Fullscreen Exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsKioskActive(false);
        setWarnings((prev) => [...prev, "Exited Fullscreen Mode"]);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 2. Detect Tab Switching (Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isKioskActive) {
        setWarnings((prev) => [...prev, "Switched Tabs / Minimized Window"]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isKioskActive]);

  // 3. Prevent Right Click (Context Menu) globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isKioskActive) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [isKioskActive]);

  // ---------------------------------------------------------------------------
  // COPY / PASTE LOGIC
  // ---------------------------------------------------------------------------

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Listen for keys to capture "Copy" or "Cut" actions specifically from this editor
    editor.onKeyDown((e) => {
      // Ctrl/Cmd + C or Ctrl/Cmd + X
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "KeyC" || e.code === "KeyX")
      ) {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (selection && model) {
          const text = model.getValueInRange(selection);
          internalClipboard.current = text;
          // console.log("Internal Copy Captured:", text);
        }
      }
    });

    // Add a custom paste handler to the editor's DOM node
    const domNode = editor.getContainerDomNode();
    domNode.addEventListener(
      "paste",
      (e: any) => {
        const pastedData = e.clipboardData?.getData("text") || "";

        // LOGIC: If pasted data matches strictly what we copied internally, allow it.
        // Otherwise, block it.
        if (
          pastedData !== internalClipboard.current ||
          internalClipboard.current === ""
        ) {
          e.preventDefault();
          e.stopPropagation();
          setWarnings((prev) => [...prev, "External Paste Attempt Blocked"]);
          // Optional: Show a toast or small alert
        } else {
          // console.log("Internal Paste Allowed");
        }
      },
      true,
    ); // Capture phase to preempt Monaco
  };

  // ---------------------------------------------------------------------------
  // SERVICE & EXECUTION LOGIC
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const checkStatus = async () => {
      setStatus("checking");
      try {
        const healthResponse = await fetch("/api/code-execution/health");
        const data = await healthResponse.json();
        setStatus(data.status === "online" ? "online" : "offline");
      } catch {
        setStatus("down");
      }
    };
    checkStatus();
  }, [currentTaskState.language]);

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
        output: "Error: Could not connect to execution server.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!workId) {
      alert("Work ID missing. Cannot submit.");
      return;
    }
    setIsSubmitting(true);
    updateCurrentTaskState({ output: "Saving code & Running Test Cases..." });

    try {
      const result = await submitTaskAction(
        workId,
        activeTask.id,
        currentTaskState.code,
        currentTaskState.language,
      );

      if (result.error) {
        updateCurrentTaskState({ output: `Submission Error: ${result.error}` });
      } else {
        const results = result.testResults || [];
        let outputLog = "--- Submission Results ---\n\n";

        if (results.length === 0) {
          outputLog += "Code saved. (No test cases defined).";
        } else {
          let passedCount = 0;
          results.forEach((res: any, idx: number) => {
            const statusIcon = res.passed ? "✅ PASS" : "❌ FAIL";
            if (res.passed) passedCount++;
            outputLog += `Test Case ${idx + 1}: ${statusIcon}\n`;
            if (!res.passed) {
              outputLog += `   Input:    ${res.input}\n`;
              outputLog += `   Expected: ${res.expected}\n`;
              outputLog += `   Actual:   ${res.actual}\n`;
            }
            outputLog += "\n";
          });
          outputLog += `Summary: ${passedCount}/${results.length} Test Cases Passed.`;
        }
        updateCurrentTaskState({ output: outputLog });
      }
    } catch (err) {
      updateCurrentTaskState({
        output: "An unexpected error occurred during submission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // LAYOUT RESIZING LOGIC
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  if (!isKioskActive) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#1a1a1a] text-white space-y-6">
        <div className="p-8 bg-[#262626] rounded-xl border border-gray-700 shadow-2xl text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Secure Exam Environment</h1>
          <p className="text-gray-400 mb-6 text-sm">
            This assessment requires Kiosk Mode.
            <br />
            Full screen will be enabled and external copy/paste is disabled.
          </p>

          {warnings.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded text-left">
              <h3 className="text-red-500 font-bold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Violations Detected (
                {warnings.length})
              </h3>
              {/*<ul className="text-xs text-red-300 list-disc list-inside max-h-24 overflow-y-auto">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>*/}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Go Back
            </button>
            <button
              onClick={enterKioskMode}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2 transition"
            >
              <Maximize size={18} />
              Enter Fullscreen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a] ${isDragging ? "select-none" : ""}`}
    >
      {/* Violations Badge (Top Right) */}
      {warnings.length > 0 && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-400 font-mono pointer-events-none">
          <AlertTriangle size={12} />
          {warnings.length}
        </div>
      )}

      {/* LEFT PANEL: Description */}
      <div
        className="flex flex-col"
        style={{ width: leftPanelWidth ?? "calc(50% - 4px)" }}
      >
        <PanelContainer className="h-full">
          <PanelHeader>
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
          <div className="flex-1 bg-[#262626] p-6 overflow-y-auto whitespace-pre-wrap text-gray-300 font-sans leading-relaxed select-none">
            {/* select-none helps prevent copying description out, optional */}
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

              {/* Language Selector */}
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
            onMount={handleEditorDidMount} // Hooking up our custom logic
            onChange={(v) => updateCurrentTaskState({ code: v || "" })}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 14,
              contextmenu: false, // Disables right-click menu in Editor
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  isRunning
                    ? "bg-gray-600 cursor-not-allowed text-gray-300"
                    : "bg-[#2cbb5d] hover:bg-[#26a351] text-white"
                }`}
              >
                {isRunning ? (
                  <Activity size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                {isRunning ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed text-gray-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <CloudUpload size={14} className="animate-bounce" />
                ) : (
                  <CloudUpload size={14} />
                )}
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
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
            <pre className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#1e1e1e] border border-[#444] rounded overflow-auto whitespace-pre-wrap">
              {currentTaskState.output || "Run code to see output..."}
            </pre>
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default CodeEditorPage;
