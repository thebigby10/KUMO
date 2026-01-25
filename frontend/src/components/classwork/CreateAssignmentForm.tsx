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
import { createLabWork } from "@/actions/work";

interface CreateAssignmentFormProps {
  labId: string;
  userEmail: string;
}

interface TestCase {
  input: string;
  expectOutput: string;
}

interface TaskData {
  uiId: string;
  title: string;
  description: string;
  pdfUrl: string;
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  isExpanded: boolean;
}

export default function CreateAssignmentForm({
  labId,
  userEmail,
}: CreateAssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(100);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Tasks List
  const [tasks, setTasks] = useState<TaskData[]>([
    {
      uiId: crypto.randomUUID(),
      title: "Problem 1",
      description: "",
      pdfUrl: "",
      starterCode: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
      testCases: [],
      hints: [],
      isExpanded: true,
    },
  ]);

  // --- Task Management Helpers ---

  const addTask = () => {
    setTasks((prev) => [
      ...prev.map((t) => ({ ...t, isExpanded: false })), // Collapse others
      {
        uiId: crypto.randomUUID(),
        title: `Problem ${prev.length + 1}`,
        description: "",
        pdfUrl: "",
        starterCode: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
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

  // --- Nested Array Helpers (Test Cases & Hints) ---

  const addTestCase = (taskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].testCases.push({ input: "", expectOutput: "" });
    setTasks(updated);
  };

  const updateTestCase = (
    taskIndex: number,
    tcIndex: number,
    field: keyof TestCase,
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
      const payload = {
        labId,
        userEmail,
        title,
        description,
        totalPoints: Number(points),
        startTime,
        endTime,
        tasks: tasks.map((t) => ({
          title: t.title,
          description: t.description,
          pdfUrl: t.pdfUrl,
          starterCode: t.starterCode,
          testCases: t.testCases,
          hints: t.hints.filter((h) => h.trim() !== ""),
        })),
      };

      const result = await createLabWork(payload);

      if (result.success) {
        router.push(`/dashboard/lab/${labId}/work`);
        router.refresh();
      } else {
        setError(result.error || "Failed to create assignment.");
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
      className="space-y-8 animate-in fade-in duration-500 pb-20"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. General Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Assignment Details
        </h3>
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Lab 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Instructions..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Points
              </label>
              <input
                type="number"
                min={0}
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-medium text-gray-800">Coding Problems</h3>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            {tasks.length} Problems
          </span>
        </div>

        {tasks.map((task, tIndex) => (
          <div
            key={task.uiId}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition hover:border-blue-300"
          >
            {/* Task Header */}
            <div
              className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
              onClick={() => toggleTask(tIndex)}
            >
              <div className="font-medium text-gray-800 flex items-center gap-2">
                {task.isExpanded ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
                {task.title || `Problem ${tIndex + 1}`}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTask(tIndex);
                }}
                className="p-2 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Task Body */}
            {task.isExpanded && (
              <div className="p-6 space-y-6 border-t border-gray-200">
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        updateTaskField(tIndex, "title", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PDF URL (Problem Statement)
                    </label>
                    <input
                      type="url"
                      value={task.pdfUrl}
                      onChange={(e) =>
                        updateTaskField(tIndex, "pdfUrl", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={task.description}
                      onChange={(e) =>
                        updateTaskField(tIndex, "description", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg outline-none"
                    />
                  </div>

                  {/* Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starter Code (Python)
                    </label>
                    <div className="h-48 border border-gray-300 rounded-lg overflow-hidden">
                      <Editor
                        height="100%"
                        defaultLanguage="python"
                        value={task.starterCode}
                        onChange={(val) =>
                          updateTaskField(tIndex, "starterCode", val || "")
                        }
                        theme="light"
                        options={{ minimap: { enabled: false }, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Test Cases
                      </label>
                      <button
                        type="button"
                        onClick={() => addTestCase(tIndex)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus size={16} /> Add Case
                      </button>
                    </div>
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      {task.testCases.map((tc, tcIndex) => (
                        <div key={tcIndex} className="flex gap-2 items-start">
                          <input
                            type="text"
                            placeholder="Input"
                            value={tc.input}
                            onChange={(e) =>
                              updateTestCase(
                                tIndex,
                                tcIndex,
                                "input",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Expected Output"
                            value={tc.expectOutput}
                            onChange={(e) =>
                              updateTestCase(
                                tIndex,
                                tcIndex,
                                "expectOutput",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeTestCase(tIndex, tcIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hints */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Hints
                      </label>
                      <button
                        type="button"
                        onClick={() => addHint(tIndex)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus size={16} /> Add Hint
                      </button>
                    </div>
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      {task.hints.map((hint, hIndex) => (
                        <div key={hIndex} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder={`Hint ${hIndex + 1}`}
                            value={hint}
                            onChange={(e) =>
                              updateHint(tIndex, hIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeHint(tIndex, hIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addTask}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition group bg-gray-50/50"
        >
          <Plus size={20} />{" "}
          <span className="font-medium">Add Another Problem</span>
        </button>
      </div>

      {/* Footer */}
      <div className="sticky bottom-4 z-10 flex justify-end gap-3 pt-4">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 flex gap-3">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Save size={18} /> Assign Lab
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
