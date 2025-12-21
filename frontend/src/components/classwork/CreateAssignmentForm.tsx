"use client";

import { useState } from "react";
import {
  Save,
  AlertCircle,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { createLabWork, editLabWork } from "@/actions/work"; // Import edit action

type TaskLanguage = "python" | "cpp" | "c" | "java";

const LANGUAGE_DEFAULTS: Record<TaskLanguage, string> = {
  python: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
};

const LANGUAGE_LABELS: Record<TaskLanguage, string> = {
  python: "Python 3",
  cpp: "C++ (GCC)",
  c: "C (GCC)",
  java: "Java (OpenJDK)",
};

interface TaskData {
  id?: string; // DB ID (optional, only exists in edit mode)
  uiId: string; // Internal React key
  title: string;
  description: string;
  pdfUrl: string;
  language: TaskLanguage;
  starterCode: string;
  testCases: { input: string; expectOutput: string }[];
  hints: string[];
  isExpanded: boolean;
}

interface CreateAssignmentFormProps {
  labId: string;
  userEmail: string;
  initialData?: any; // New Prop for Edit Mode
}

export default function CreateAssignmentForm({
  labId,
  userEmail,
  initialData,
}: CreateAssignmentFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format Date for input
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format: YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  };

  // --- State Initialization ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [points, setPoints] = useState(initialData?.totalPoints || 100);
  const [startTime, setStartTime] = useState(
    formatDate(initialData?.startTime),
  );
  const [endTime, setEndTime] = useState(formatDate(initialData?.endTime));

  // Initialize Tasks from DB data or Default
  const [tasks, setTasks] = useState<TaskData[]>(() => {
    if (initialData?.tasks) {
      return initialData.tasks.map((t: any, index: number) => ({
        id: t.id,
        uiId: t.id, // Use DB ID as UI ID for existing tasks
        title: t.title,
        description: t.description || "",
        pdfUrl: t.url || "", // Map DB 'url' to 'pdfUrl'
        language: (t.language || "python") as TaskLanguage,
        starterCode: t.editors[0]?.solution || "",
        testCases: t.testCases || [],
        hints: t.hints?.map((h: any) => h.hint) || [],
        isExpanded: index === 0,
      }));
    }
    return [
      {
        uiId: crypto.randomUUID(),
        title: "Problem 1",
        description: "",
        pdfUrl: "",
        language: "python" as TaskLanguage,
        starterCode: LANGUAGE_DEFAULTS.python,
        testCases: [],
        hints: [],
        isExpanded: true,
      },
    ];
  });

  // --- Helpers (Same as before) ---
  const addTask = () => {
    setTasks((prev) => [
      ...prev.map((t) => ({ ...t, isExpanded: false })),
      {
        uiId: crypto.randomUUID(),
        title: `Problem ${prev.length + 1}`,
        description: "",
        pdfUrl: "",
        language: "python" as TaskLanguage,
        starterCode: LANGUAGE_DEFAULTS.python,
        testCases: [],
        hints: [],
        isExpanded: true,
      },
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const toggleTask = (index: number) => {
    setTasks(
      tasks.map((t, i) => ({
        ...t,
        isExpanded: i === index ? !t.isExpanded : false,
      })),
    );
  };

  const updateTaskField = (
    index: number,
    field: keyof TaskData,
    value: any,
  ) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const addTestCase = (taskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].testCases.push({ input: "", expectOutput: "" });
    setTasks(updated);
  };

  const updateTestCase = (
    taskIndex: number,
    tcIndex: number,
    field: "input" | "expectOutput",
    value: string,
  ) => {
    const updated = [...tasks];
    updated[taskIndex].testCases[tcIndex][field] = value;
    setTasks(updated);
  };

  const removeTestCase = (taskIndex: number, tcIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].testCases = updated[taskIndex].testCases.filter(
      (_, i) => i !== tcIndex,
    );
    setTasks(updated);
  };

  const addHint = (taskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].hints.push("");
    setTasks(updated);
  };

  const updateHint = (taskIndex: number, hintIndex: number, value: string) => {
    const updated = [...tasks];
    updated[taskIndex].hints[hintIndex] = value;
    setTasks(updated);
  };

  const removeHint = (taskIndex: number, hintIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].hints = updated[taskIndex].hints.filter(
      (_, i) => i !== hintIndex,
    );
    setTasks(updated);
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (tasks.length === 0) {
      setError("Please add at least one problem.");
      setLoading(false);
      return;
    }

    try {
      const commonPayload = {
        labId,
        userEmail,
        title,
        description,
        totalPoints: Number(points),
        startTime,
        endTime,
        tasks: tasks.map((t) => ({
          id: t.id, // Include ID for editing
          title: t.title,
          description: t.description,
          pdfUrl: t.pdfUrl,
          language: t.language,
          starterCode: t.starterCode,
          testCases: t.testCases,
          hints: t.hints.filter((h) => h.trim() !== ""),
        })),
      };

      let result;
      if (isEditMode) {
        result = await editLabWork({
          ...commonPayload,
          workId: initialData.id,
        });
      } else {
        result = await createLabWork(commonPayload);
      }

      if (result.success) {
        router.push(`/dashboard/lab/${labId}/work`);
        router.refresh();
      } else {
        setError(result.error || "Failed to save assignment.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

 return (
  <form
    onSubmit={handleSubmit}
    className="space-y-10 animate-in fade-in duration-300 pb-28"
  >
    {/* Error */}
    {error && (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    )}

    {/* 1. Assignment Info */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
        {isEditMode ? "Edit Assignment" : "Assignment Details"}
      </h3>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400
              border border-gray-200 rounded-lg
              focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none"
            placeholder="e.g. Lab 1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400
              border border-gray-200 rounded-lg outline-none"
          />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Total Points
            </label>
            <input
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 text-gray-900
                border border-gray-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-700
                border border-gray-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-700
                border border-gray-200 rounded-lg outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    {/* 2. Problems */}
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Coding Problems
        </h3>
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          {tasks.length} Problems
        </span>
      </div>

      {tasks.map((task, tIndex) => (
        <div
          key={task.uiId}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div
            onClick={() => toggleTask(tIndex)}
            className="flex items-center justify-between px-6 py-4 cursor-pointer
              bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              {task.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {task.title || `Problem ${tIndex + 1}`}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTask(tIndex);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {task.isExpanded && (
            <div className="p-6 space-y-6 border-t border-gray-200">
              {/* Task Fields */}
              <input
                value={task.title}
                onChange={(e) =>
                  updateTaskField(tIndex, "title", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50 text-gray-900
                  border border-gray-200 rounded-lg outline-none"
                placeholder="Problem title"
              />

              <input
                value={task.pdfUrl}
                onChange={(e) =>
                  updateTaskField(tIndex, "pdfUrl", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50 text-gray-900
                  border border-gray-200 rounded-lg outline-none"
                placeholder="PDF URL"
              />

              <textarea
                rows={2}
                value={task.description}
                onChange={(e) =>
                  updateTaskField(tIndex, "description", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50 text-gray-900
                  border border-gray-200 rounded-lg outline-none"
                placeholder="Problem description"
              />

              {/* Language Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Programming Language
                </label>
                <select
                  value={task.language}
                  onChange={(e) => {
                    const newLang = e.target.value as TaskLanguage;
                    const updated = [...tasks];
                    updated[tIndex] = {
                      ...updated[tIndex],
                      language: newLang,
                      starterCode: LANGUAGE_DEFAULTS[newLang],
                    };
                    setTasks(updated);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-900
                    border border-gray-200 rounded-lg outline-none"
                >
                  {(Object.keys(LANGUAGE_LABELS) as TaskLanguage[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_LABELS[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage={task.language === "cpp" ? "cpp" : task.language}
                  language={task.language === "cpp" ? "cpp" : task.language}
                  value={task.starterCode}
                  onChange={(val) =>
                    updateTaskField(tIndex, "starterCode", val || "")
                  }
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13 }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Test Cases
                  </label>
                  <button
                    type="button"
                    onClick={() => addTestCase(tIndex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pink-500 hover:text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    Add Test Case
                  </button>
                </div>
                {task.testCases.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No test cases yet. Add test cases to enable auto-grading.
                  </p>
                )}
                {task.testCases.map((tc, tcIdx) => (
                  <div
                    key={tcIdx}
                    className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-500 mt-1">
                      {tcIdx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">
                          Input
                        </label>
                        <textarea
                          rows={2}
                          value={tc.input}
                          onChange={(e) =>
                            updateTestCase(tIndex, tcIdx, "input", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white text-gray-900 text-sm font-mono border border-gray-200 rounded-lg outline-none resize-none placeholder-gray-400"
                          placeholder="stdin input"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">
                          Expected Output
                        </label>
                        <textarea
                          rows={2}
                          value={tc.expectOutput}
                          onChange={(e) =>
                            updateTestCase(tIndex, tcIdx, "expectOutput", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white text-gray-900 text-sm font-mono border border-gray-200 rounded-lg outline-none resize-none placeholder-gray-400"
                          placeholder="expected stdout"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCase(tIndex, tcIdx)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Hints
                  </label>
                  <button
                    type="button"
                    onClick={() => addHint(tIndex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    Add Hint
                  </button>
                </div>
                {task.hints.map((hint, hIdx) => (
                  <div
                    key={hIdx}
                    className="flex items-center gap-3"
                  >
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-500">
                      {hIdx + 1}
                    </span>
                    <input
                      value={hint}
                      onChange={(e) => updateHint(tIndex, hIdx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-900 text-sm border border-gray-200 rounded-lg outline-none placeholder-gray-400"
                      placeholder="Enter a hint"
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(tIndex, hIdx)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Problem */}
      <button
        type="button"
        onClick={addTask}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300
          text-gray-400 hover:text-pink-500 hover:border-pink-300
          transition flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        <span className="font-medium">Add Another Problem</span>
      </button>
    </div>

    {/* Footer */}
    <div className="fixed bottom-6 right-8 z-20">
      <div className="flex gap-3 bg-white border border-gray-200 p-2 rounded-xl shadow-lg">
        <Link
          href={`/dashboard/lab/${labId}/work`}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm text-white rounded-lg
            bg-gradient-to-r from-pink-500 to-rose-500
            hover:from-pink-600 hover:to-rose-600
            disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={16} />
          {isEditMode ? "Update" : "Assign"}
        </button>
      </div>
    </div>
  </form>
);

}
