"use client";

import { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  User,
  CheckCircle2,
  Save,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { gradeTaskAction } from "@/actions/grading";

// Types matching the Prisma include result from SubmissionRepository
interface SubmissionData {
  id: string;
  code: string;
  language: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  taskId: string;
  userEmail: string;
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
  };
  task: {
    title: string;
    point: number;
  };
}

interface GradingInterfaceProps {
  submissions: SubmissionData[];
  labId: string;
  workId: string;
}

export default function GradingInterface({
  submissions,
  labId,
  workId,
}: GradingInterfaceProps) {
  // 1. Group Data by Student
  // We transform the flat list of submissions into a Student -> [Tasks] structure
  const students = useMemo(() => {
    const map = new Map<
      string,
      { user: SubmissionData["user"]; tasks: SubmissionData[] }
    >();

    submissions.forEach((sub) => {
      if (!map.has(sub.userEmail)) {
        map.set(sub.userEmail, { user: sub.user, tasks: [] });
      }
      map.get(sub.userEmail)!.tasks.push(sub);
    });

    return Array.from(map.values());
  }, [submissions]);

  // 2. UI State
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Derived State based on search
  const filteredStudents = students.filter(
    (s) =>
      (s.user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeStudent = filteredStudents[selectedStudentIndex];
  // Safety check: if search changes and index is out of bounds, or list is empty
  const activeSubmission = activeStudent?.tasks[selectedTaskIndex];

  // Grading Form State (Must sync when selection changes)
  // We use a key on the inputs to force re-render/reset when the active submission ID changes
  const [currentGrade, setCurrentGrade] = useState<string>("");
  const [currentFeedback, setCurrentFeedback] = useState("");

  // Handler to safely switch context
  const handleSelectionChange = (studentIdx: number, taskIdx: number) => {
    setSelectedStudentIndex(studentIdx);
    setSelectedTaskIndex(taskIdx);

    // We update state immediately for the new selection
    const sub = filteredStudents[studentIdx]?.tasks[taskIdx];
    if (sub) {
      setCurrentGrade(sub.grade?.toString() || "");
      setCurrentFeedback(sub.feedback || "");
    }
  };

  const handleSave = async () => {
    if (!activeSubmission) return;
    setLoading(true);

    const gradeNum = parseInt(currentGrade);

    if (
      isNaN(gradeNum) ||
      gradeNum < 0 ||
      gradeNum > activeSubmission.task.point
    ) {
      alert(`Grade must be between 0 and ${activeSubmission.task.point}`);
      setLoading(false);
      return;
    }

    const res = await gradeTaskAction(
      activeSubmission.id,
      labId,
      workId,
      gradeNum,
      currentFeedback,
    );

    if (res?.error) {
      alert(res.error);
    } else {
      // Optimistic update locally could go here, but revalidatePath in action handles it on refresh
    }

    setLoading(false);
  };

  // Update local state when activeSubmission changes (e.g. initial load or props update)
  useMemo(() => {
    if (activeSubmission) {
      setCurrentGrade(activeSubmission.grade?.toString() || "");
      setCurrentFeedback(activeSubmission.feedback || "");
    }
  }, [activeSubmission]);

  if (!activeStudent)
    return (
      <div className="p-10 text-center text-gray-500">
        No students found or no submissions yet.
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* LEFT SIDEBAR: Students List */}
      <div className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedStudentIndex(0);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map((student, idx) => {
            const isSelected = idx === selectedStudentIndex;
            // Check if all tasks for this student are graded
            const allGraded = student.tasks.every(
              (t) => t.status === "RETURNED",
            );

            return (
              <button
                key={student.user.email}
                onClick={() => handleSelectionChange(idx, 0)} // Reset to first task when switching student
                className={`w-full flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition text-left ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isSelected ? "bg-blue-600" : "bg-gray-400"}`}
                >
                  {student.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                  >
                    {student.user.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student.user.email}
                  </p>
                </div>
                {allGraded && (
                  <CheckCircle2 size={16} className="text-green-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Task Tabs & Code View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Task Tabs */}
        <div className="h-14 bg-white border-b flex items-end px-4 gap-2 overflow-x-auto">
          {activeStudent.tasks.map((sub, idx) => {
            const isTaskSelected = idx === selectedTaskIndex;
            return (
              <button
                key={sub.taskId}
                onClick={() => handleSelectionChange(selectedStudentIndex, idx)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isTaskSelected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}
              >
                {sub.task.title}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    sub.status === "RETURNED"
                      ? "bg-green-100 text-green-700"
                      : sub.status === "SUBMITTED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {sub.grade !== null ? sub.grade : "-"} / {sub.task.point}
                </span>
              </button>
            );
          })}
        </div>

        {/* Read-Only Editor */}
        <div className="flex-1 relative bg-gray-50">
          {activeSubmission ? (
            <Editor
              height="100%"
              defaultLanguage="python"
              language="python"
              value={activeSubmission.code || "# No code submitted"}
              theme="light"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a task to view code
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Grading Form */}
      <div className="w-80 bg-white border-l flex flex-col shadow-xl z-10 shrink-0">
        {activeSubmission ? (
          <>
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {activeSubmission.task.title}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <User size={16} />
                <span className="truncate">{activeStudent.user.name}</span>
              </div>
              <div className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status:{" "}
                <span
                  className={`${activeSubmission.status === "SUBMITTED" ? "text-green-600" : "text-gray-600"}`}
                >
                  {activeSubmission.status}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Grade Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (Max: {activeSubmission.task.point})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={activeSubmission.task.point}
                    value={currentGrade}
                    onChange={(e) => setCurrentGrade(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="0"
                  />
                  <span className="text-gray-500 font-medium">
                    / {activeSubmission.task.point}
                  </span>
                </div>
              </div>

              {/* Feedback Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback to Student
                </label>
                <textarea
                  rows={8}
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none transition"
                  placeholder="Great job on the logic, consider optimizing..."
                />
              </div>

              {/* Navigation */}
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                <button
                  onClick={() =>
                    selectedStudentIndex > 0 &&
                    handleSelectionChange(selectedStudentIndex - 1, 0)
                  }
                  disabled={selectedStudentIndex === 0}
                  className="hover:text-blue-600 disabled:opacity-30 flex items-center gap-1 transition"
                >
                  <ChevronLeft size={16} /> Prev Student
                </button>
                <button
                  onClick={() =>
                    selectedStudentIndex < filteredStudents.length - 1 &&
                    handleSelectionChange(selectedStudentIndex + 1, 0)
                  }
                  disabled={
                    selectedStudentIndex === filteredStudents.length - 1
                  }
                  className="hover:text-blue-600 disabled:opacity-30 flex items-center gap-1 transition"
                >
                  Next Student <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70 shadow-sm"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />{" "}
                    {activeSubmission.status === "RETURNED"
                      ? "Update Grade"
                      : "Return Grade"}
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a submission to grade
          </div>
        )}
      </div>
    </div>
  );
}
