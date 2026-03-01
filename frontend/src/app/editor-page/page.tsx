"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Activity,
  ChevronDown,
  CloudUpload,
  Maximize,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  FlaskConical,
} from "lucide-react";
import Editor, { OnMount } from "@monaco-editor/react";
import PanelContainer from "./PanelContainer";
import PanelHeader from "./PanelHeader";
import ResizeHandle from "./ResizeHandle";
import AiChatPanel from "./AiChatPanel";
import {
  submitTaskAction,
  autoSaveCode,
  logViolationAction,
  runTestsAction,
} from "@/actions/submission";

// --- Types ---
type LanguageKey = "cpp" | "c" | "java" | "python";
type ServiceStatus = "checking" | "online" | "offline" | "down";
type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface Task {
  id: string;
  title: string;
  description?: string;
  url?: string | null;
  initialCode?: string;
  initialLanguage?: string;
  testCaseCount?: number;
}

interface CodeEditorPageProps {
  tasks: Task[];
  workId: string;
  endTime: string | null;
}

const LANGUAGES = [{ key: "python" as LanguageKey, label: "Python" }];

const CodeEditorPageInner = ({ tasks, workId, endTime }: CodeEditorPageProps) => {
  const router = useRouter();

  // Normalize DB language
  const normalizeLang = (lang: string): LanguageKey => {
    if (lang === "c" || lang === "cpp" || lang === "java" || lang === "python")
      return lang;
    return "python";
  };

  // --- REFS ---
  const editorRef = useRef<any>(null);
  const internalClipboard = useRef<string>("");
  const violationCountRef = useRef(0); // Tracks sent violations to avoid dupes

  // --- STATE ---
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const activeTask = tasks[activeTaskIndex];

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
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Sync & Timer State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  // KIOSK STATE
  const [isKioskActive, setIsKioskActive] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // AI CHAT STATE
  const [showAiChat, setShowAiChat] = useState(false);

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
    // Mark as unsaved when code changes
    if (updates.code !== undefined) {
      setSaveStatus("unsaved");
    }
  };

  // ---------------------------------------------------------------------------
  // 1. TIMER & AUTO SUBMIT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        handleForceSubmit();
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format to HH:MM:SS
        const formatted = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        setTimeLeft(formatted);

        // Urgent if less than 5 minutes
        if (distance < 5 * 60 * 1000) setIsUrgent(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const handleForceSubmit = async () => {
    // Force submit active task (ideally should loop all tasks)
    await submitTaskAction(
      workId,
      activeTask.id,
      currentTaskState.code,
      currentTaskState.language,
      true, // force flag
    );
    alert("Time is up! Your work has been submitted automatically.");
    router.push("/dashboard");
  };

  // ---------------------------------------------------------------------------
  // 2. AUTO SAVE (Every 15s)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      // Only save if status is 'unsaved' to prevent unnecessary calls
      if (saveStatus === "unsaved") {
        setSaveStatus("saving");
        const res = await autoSaveCode(activeTask.id, currentTaskState.code);
        if (res.success) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      }
    }, 15000); // 15 seconds
    console.log(activeTask);
    return () => clearInterval(autoSaveInterval);
  }, [saveStatus, activeTask.id, currentTaskState.code]);

  // ---------------------------------------------------------------------------
  // 3. VIOLATION LOGGING (Server Sync)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const logNewViolations = async () => {
      // If we have more warnings locally than we've sent to server
      if (warnings.length > violationCountRef.current) {
        const newViolationCount = warnings.length;
        // Get the latest warning description
        const latestWarning = warnings[warnings.length - 1];

        // Update ref immediately to prevent loops
        violationCountRef.current = newViolationCount;

        // Send to server
        await logViolationAction(activeTask.id, latestWarning);
      }
    };

    logNewViolations();
  }, [warnings, activeTask.id]);

  // ---------------------------------------------------------------------------
  // KIOSK MODE LOGIC (Existing + Updates)
  // ---------------------------------------------------------------------------

  // ... (Paste Interceptor, Fullscreen handlers - kept from previous version) ...
  // Re-implementing briefly for completeness context

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const pastedData = e.clipboardData?.getData("text") || "";
      const internalData = internalClipboard.current;
      if (pastedData !== internalData) {
        e.preventDefault();
        e.stopPropagation();
        setWarnings((prev) => [...prev, "External Paste Blocked"]);
      }
    };
    const handleGlobalCopy = () => {
      const selection = document.getSelection();
      if (selection) internalClipboard.current = selection.toString();
    };
    window.addEventListener("paste", handleGlobalPaste, true);
    window.addEventListener("copy", handleGlobalCopy, true);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste, true);
      window.removeEventListener("copy", handleGlobalCopy, true);
    };
  }, []);

  const enterKioskMode = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsKioskActive(true));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsKioskActive(false);
        setWarnings((prev) => [...prev, "Exited Fullscreen Mode"]);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isKioskActive) {
        setWarnings((prev) => [...prev, "Tab Switch / Minimized"]);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isKioskActive]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    const domNode = editor.getContainerDomNode();
    const handleMonacoCopy = () => {
      const selection = editor.getSelection();
      const model = editor.getModel();
      if (selection && model)
        internalClipboard.current = model.getValueInRange(selection);
    };
    domNode.addEventListener("copy", handleMonacoCopy);
    domNode.addEventListener("cut", handleMonacoCopy);
  };

  // ---------------------------------------------------------------------------
  // EXECUTION LOGIC
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
      const outputText = response.ok
        ? (data.output || data.stdout || "Program finished.") +
          (data.stderr ? "\n" + data.stderr : "")
        : `Error: ${data.error || "Execution failed"}`;
      updateCurrentTaskState({ output: outputText });
    } catch {
      updateCurrentTaskState({ output: "Error: Connection failed." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveStatus("saving"); // Submit implies save
    updateCurrentTaskState({ output: "Saving & Running Tests..." });

    try {
      const result = await submitTaskAction(
        workId,
        activeTask.id,
        currentTaskState.code,
        currentTaskState.language,
      );

      setSaveStatus("saved"); // Force saved status after submit

      if (result.error) {
        updateCurrentTaskState({ output: `Submission Error: ${result.error}` });
      } else {
        const results = result.testResults || [];
        let outputLog = "--- Submission Results ---\n\n";
        let passedCount = 0;

        results.forEach((res: any, idx: number) => {
          if (res.passed) passedCount++;
          outputLog += `Test Case ${idx + 1}: ${res.passed ? "✅ PASS" : "❌ FAIL"}\n`;
          if (!res.passed) {
            outputLog += `    Input: ${res.input}\n    Expected: ${res.expected}\n    Actual: ${res.actual}\n`;
          }
        });

        outputLog +=
          results.length === 0
            ? "Code saved. (No tests defined)."
            : `\nSummary: ${passedCount}/${results.length} Passed.`;

        updateCurrentTaskState({ output: outputLog });
      }
    } catch {
      updateCurrentTaskState({ output: "Submission failed unexpectedly." });
      setSaveStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RUN TESTS (without submitting)
  // ---------------------------------------------------------------------------
  const handleRunTests = async () => {
    if (!activeTask.testCaseCount) return;
    setIsRunningTests(true);
    updateCurrentTaskState({ output: "Running test cases..." });

    try {
      const result = await runTestsAction(
        activeTask.id,
        currentTaskState.code,
        currentTaskState.language,
      );

      if (result.error) {
        updateCurrentTaskState({ output: `Test Error: ${result.error}` });
        return;
      }

      const results = result.testResults || [];
      let outputLog = "--- Test Results ---\n\n";
      let passedCount = 0;

      results.forEach((res: any, idx: number) => {
        if (res.passed) passedCount++;
        outputLog += `Test Case ${idx + 1}: ${res.passed ? "✅ PASS" : "❌ FAIL"}\n`;
        if (!res.passed) {
          outputLog += `    Input:    ${res.input}\n    Expected: ${res.expected}\n    Actual:   ${res.actual}\n`;
          if (res.error) outputLog += `    Error:    ${res.error}\n`;
        }
      });

      outputLog +=
        results.length === 0
          ? "No test cases defined for this task."
          : `\nSummary: ${passedCount}/${results.length} Passed`;

      updateCurrentTaskState({ output: outputLog });
    } catch {
      updateCurrentTaskState({ output: "Test execution failed unexpectedly." });
    } finally {
      setIsRunningTests(false);
    }
  };

  // ---------------------------------------------------------------------------
  // LAYOUT RESIZING (Same as before)
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
          setBottomPanelHeight(
            Math.max(
              100,
              Math.min(
                window.innerHeight - 150,
                startBottomHeight + (startY - e.clientY),
              ),
            ),
          );
        } else if (type === "horizontal") {
          setLeftPanelWidth(
            Math.max(
              200,
              Math.min(
                window.innerWidth - 200,
                startLeftWidth + (e.clientX - startX),
              ),
            ),
          );
        } else if (type === "input" && containerRect) {
          setInputWidth(
            Math.max(
              10,
              Math.min(
                90,
                ((e.clientX - containerRect.left) / containerRect.width) * 100,
              ),
            ),
          );
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
              {/*<ul className="mt-2 space-y-1">
                {warnings.slice(-3).map((w, i) => (
                  <li key={i} className="text-xs text-red-300">
                    • {w}
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-xs text-red-300">
                    ...and {warnings.length - 3} more
                  </li>
                )}
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
              <Maximize size={18} /> Enter Fullscreen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-screen h-screen gap-1 p-2 overflow-hidden text-gray-100 bg-[#1a1a1a] select-none ${isDragging ? "select-none" : ""}`}
    >
      {/* Violation Badge */}
      {warnings.length > 0 && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-400 font-mono pointer-events-none">
          <AlertTriangle size={12} />
          {warnings.length}
        </div>
      )}

      {/* LEFT PANEL: Task Description */}
      <div
        className="flex flex-col"
        style={{ width: leftPanelWidth ?? "calc(50% - 4px)" }}
      >
        <PanelContainer className="h-full">
          <PanelHeader>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {tasks.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTaskIndex(index)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-t transition-colors whitespace-nowrap ${
                    activeTaskIndex === index
                      ? "bg-[#262626] text-green-500 border-b-2 border-green-500"
                      : "bg-[#1a1a1a] text-gray-400 hover:text-gray-200 hover:bg-[#222]"
                  }`}
                >
                  {task.title}
                </button>
              ))}
            </div>
          </PanelHeader>
          <div className="flex flex-col h-full bg-[#111] overflow-hidden">
            {activeTask.description && activeTask.description !== "No description." && (
              <div className="shrink-0 px-4 py-3 border-b border-[#2a2a2a] bg-[#161616]">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {activeTask.description}
                </p>
              </div>
            )}
            <div className="flex-1 min-h-0">
              {activeTask.url ? (
                <object
                  data={activeTask.url}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  className="block"
                >
                  <iframe
                    src={activeTask.url}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </object>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No PDF provided.
                </div>
              )}
            </div>
          </div>
        </PanelContainer>
      </div>

      <ResizeHandle
        direction="horizontal"
        onMouseDown={(e) => startResizing("horizontal", e)}
      />

      {/* RIGHT PANEL: Editor & Console */}
      <div className="flex flex-col flex-1 min-w-0 gap-3">
        {/* Code Editor */}
        <PanelContainer
          style={{ height: `calc(100vh - ${bottomPanelHeight}px - 24px)` }}
        >
          <PanelHeader>
            <div className="flex items-center justify-between w-full">
              {/* Left Side of Header: Lang Selector */}
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-green-500">
                  &lt;/&gt; Code
                </span>
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
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-[#3a3a3a] transition-colors ${currentTaskState.language === lang.key ? "bg-[#3a3a3a] text-green-500" : "text-gray-300"}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side of Header: Status Indicators */}
              <div className="flex items-center gap-3">
                {/* Timer */}
                {timeLeft && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-mono transition-colors ${
                      isUrgent
                        ? "bg-red-900/40 border-red-500/50 text-red-400 animate-pulse"
                        : "bg-[#333] border-[#444] text-gray-300"
                    }`}
                  >
                    <Clock size={13} />
                    <span>{timeLeft}</span>
                  </div>
                )}

                {/* Save Status */}
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#333] border border-[#444] min-w-[90px] justify-center">
                  {saveStatus === "saving" && (
                    <RefreshCw
                      size={13}
                      className="animate-spin text-blue-400"
                    />
                  )}
                  {saveStatus === "saved" && (
                    <CheckCircle2 size={13} className="text-green-500" />
                  )}
                  {saveStatus === "unsaved" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  )}
                  {saveStatus === "error" && (
                    <WifiOff size={13} className="text-red-500" />
                  )}

                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">
                    {saveStatus === "unsaved" ? "Unsaved" : saveStatus}
                  </span>
                </div>
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
            onMount={handleEditorDidMount}
            onChange={(v) => updateCurrentTaskState({ code: v || "" })}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 14,
              contextmenu: false,
            }}
          />
        </PanelContainer>

        <ResizeHandle
          direction="vertical"
          onMouseDown={(e) => startResizing("vertical", e)}
        />

        {/* Console / Output */}
        <PanelContainer style={{ height: `${bottomPanelHeight}px` }}>
          <PanelHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-white px-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#333] text-[10px] font-bold border border-[#444]">
                <div
                  className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-gray-400 uppercase">{status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${isRunning ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-[#2cbb5d] hover:bg-[#26a351] text-white"}`}
              >
                {isRunning ? (
                  <Activity size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                {isRunning ? "Running..." : "Run"}
              </button>
              {(activeTask.testCaseCount ?? 0) > 0 && (
                <button
                  onClick={handleRunTests}
                  disabled={isRunning || isSubmitting || isRunningTests}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${isRunningTests ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
                >
                  {isRunningTests ? (
                    <Activity size={14} className="animate-spin" />
                  ) : (
                    <FlaskConical size={14} />
                  )}
                  {isRunningTests ? "Testing..." : "Run Tests"}
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${isSubmitting ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
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
              className="p-3 font-mono text-sm text-gray-300 bg-[#1a1a1a] border border-[#444] rounded outline-none resize-none select-text"
              style={{ width: `${inputWidth}%` }}
              placeholder="Stdin (Input)..."
            />
            <div
              onMouseDown={(e) => startResizing("input", e)}
              className="w-1 cursor-ew-resize hover:bg-blue-500/20"
            />
            <pre className="flex-1 p-3 font-mono text-sm text-gray-300 bg-[#1e1e1e] border border-[#444] rounded overflow-auto whitespace-pre-wrap select-text">
              {currentTaskState.output || "Run code to see output..."}
            </pre>
          </div>
        </PanelContainer>
      </div>
      {/* AI Chat Floating Button */}
      <button
        onClick={() => setShowAiChat((v) => !v)}
        className={`fixed bottom-6 right-6 z-99 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          showAiChat
            ? "bg-purple-600 hover:bg-purple-500 scale-90"
            : "bg-[#333] hover:bg-purple-600 border border-[#555] hover:border-purple-500"
        }`}
        title="AI Assistant"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
      </button>

      {/* AI Chat Panel */}
      <AiChatPanel
        taskId={activeTask.id}
        taskTitle={activeTask.title}
        taskDescription={activeTask.description || ""}
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
      />
    </div>
  );
};

const CodeEditorPage = (props: Partial<CodeEditorPageProps> = {}) => {
  const tasks = props.tasks;
  const workId = props.workId;
  const endTime = props.endTime ?? null;

  if (!tasks || tasks.length === 0 || !workId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-gray-400">
        Open an assignment to start coding.
      </div>
    );
  }

  return <CodeEditorPageInner tasks={tasks} workId={workId} endTime={endTime} />;
};

export default CodeEditorPage;
