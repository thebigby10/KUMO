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

interface TaskData {
  id?: string; // DB ID (optional, only exists in edit mode)
  uiId: string; // Internal React key
  title: string;
  description: string;
  pdfUrl: string;
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
        starterCode: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
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
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    )}

    {/* 1. Assignment Info */}
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">
        {isEditMode ? "Edit Assignment" : "Assignment Details"}
      </h3>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1 block">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-500
              border border-slate-700 rounded-lg
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            placeholder="e.g. Lab 1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1 block">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-500
              border border-slate-700 rounded-lg outline-none"
          />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">
              Total Points
            </label>
            <input
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-800 text-white
                border border-slate-700 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 text-slate-300
                border border-slate-700 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 text-slate-300
                border border-slate-700 rounded-lg outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    {/* 2. Problems */}
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Coding Problems
        </h3>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {tasks.length} Problems
        </span>
      </div>

      {tasks.map((task, tIndex) => (
        <div
          key={task.uiId}
          className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div
            onClick={() => toggleTask(tIndex)}
            className="flex items-center justify-between px-6 py-4 cursor-pointer
              bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              {task.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {task.title || `Problem ${tIndex + 1}`}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTask(tIndex);
              }}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {task.isExpanded && (
            <div className="p-6 space-y-6 border-t border-slate-700">
              {/* Task Fields */}
              <input
                value={task.title}
                onChange={(e) =>
                  updateTaskField(tIndex, "title", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 text-white
                  border border-slate-700 rounded-lg outline-none"
                placeholder="Problem title"
              />

              <input
                value={task.pdfUrl}
                onChange={(e) =>
                  updateTaskField(tIndex, "pdfUrl", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 text-white
                  border border-slate-700 rounded-lg outline-none"
                placeholder="PDF URL"
              />

              <textarea
                rows={2}
                value={task.description}
                onChange={(e) =>
                  updateTaskField(tIndex, "description", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-800 text-white
                  border border-slate-700 rounded-lg outline-none"
                placeholder="Problem description"
              />

              {/* Editor */}
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="python"
                  value={task.starterCode}
                  onChange={(val) =>
                    updateTaskField(tIndex, "starterCode", val || "")
                  }
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13 }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Problem */}
      <button
        type="button"
        onClick={addTask}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700
          text-slate-400 hover:text-blue-400 hover:border-blue-500/50
          transition flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        <span className="font-medium">Add Another Problem</span>
      </button>
    </div>

    {/* Footer */}
    <div className="fixed bottom-6 right-8 z-20">
      <div className="flex gap-3 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-xl">
        <Link
          href={`/dashboard/lab/${labId}/work`}
          className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm text-white rounded-lg
            bg-gradient-to-r from-blue-600 to-indigo-600
            hover:from-blue-500 hover:to-indigo-500
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
