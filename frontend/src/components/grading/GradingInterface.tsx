"use client";

import { useState, useMemo, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiClock,
  FiSend,
  FiFileText,
  FiAward,
  FiMessageSquare,
  FiUser,
  FiLoader,
} from "react-icons/fi";
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Derived State based on search
  const filteredStudents = students.filter(
    (s) =>
      (s.user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeStudent = filteredStudents[selectedStudentIndex];
  const activeSubmission = activeStudent?.tasks[selectedTaskIndex];

  // Grading Form State
  const [currentGrade, setCurrentGrade] = useState<string>("");
  const [currentFeedback, setCurrentFeedback] = useState("");

  // Handler to safely switch context
  const handleSelectionChange = (studentIdx: number, taskIdx: number) => {
    setSelectedStudentIndex(studentIdx);
    setSelectedTaskIndex(taskIdx);
    setSaveSuccess(false);

    const sub = filteredStudents[studentIdx]?.tasks[taskIdx];
    if (sub) {
      setCurrentGrade(sub.grade?.toString() || "");
      setCurrentFeedback(sub.feedback || "");
    }
  };

  const handleSave = async () => {
    if (!activeSubmission) return;
    setLoading(true);
    setSaveSuccess(false);

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setLoading(false);
  };

  // Update local state when activeSubmission changes
  useEffect(() => {
    if (activeSubmission) {
      setCurrentGrade(activeSubmission.grade?.toString() || "");
      setCurrentFeedback(activeSubmission.feedback || "");
    }
  }, [activeSubmission]);

  // Calculate stats
  const totalStudents = filteredStudents.length;
  const gradedStudents = filteredStudents.filter((s) =>
    s.tasks.every((t) => t.status === "RETURNED"),
  ).length;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <FiCheckCircle size={12} />
            Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FiClock size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-400 border border-slate-600">
            <FiFileText size={12} />
            Draft
          </span>
        );
    }
  };

  if (!activeStudent)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-400">
        <FiUser size={48} className="text-slate-700 mb-4" />
        <p className="text-lg font-semibold text-white">No students found</p>
        <p className="text-sm">There are no submissions to grade yet.</p>
      </div>
    );

  return (
    <div className="flex h-full bg-slate-900">
      {/* LEFT PANEL: Students List */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Search & Stats Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
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
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {gradedStudents} of {totalStudents} graded
            </span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                style={{
                  width: `${totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map((student, idx) => {
            const isSelected = idx === selectedStudentIndex;
            const allGraded = student.tasks.every(
              (t) => t.status === "RETURNED",
            );
            const totalPoints = student.tasks.reduce(
              (sum, t) => sum + t.task.point,
              0,
            );
            const earnedPoints = student.tasks.reduce(
              (sum, t) => sum + (t.grade || 0),
              0,
            );

            return (
              <button
                key={student.user.email}
                onClick={() => handleSelectionChange(idx, 0)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2 ${
                  isSelected
                    ? "bg-blue-500/10 border-l-blue-500"
                    : "border-l-transparent hover:bg-slate-800/50"
                }`}
              >
                {/* Avatar */}
                {student.user.avatar ? (
                  <img
                    src={student.user.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700 shadow-lg"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-slate-600 to-slate-700"
                    }`}
                  >
                    {student.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {student.user.name || "Unknown Student"}
                    </p>
                    {allGraded && (
                      <FiCheckCircle
                        size={14}
                        className="text-green-400 shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 truncate">
                      {student.tasks.length} tasks
                    </span>
                    {allGraded && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-medium text-green-400">
                          {earnedPoints}/{totalPoints}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Task Navigation Bar */}
        <div className="h-12 bg-slate-950 border-b border-slate-800 flex items-center px-2 gap-1 overflow-x-auto shrink-0">
          {activeStudent.tasks.map((sub, idx) => {
            const isTaskSelected = idx === selectedTaskIndex;
            const isGraded = sub.status === "RETURNED";

            return (
              <button
                key={sub.taskId}
                onClick={() => handleSelectionChange(selectedStudentIndex, idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isTaskSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="truncate max-w-[120px]">{sub.task.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                    isTaskSelected
                      ? "bg-white/20 text-white"
                      : isGraded
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {sub.grade !== null ? sub.grade : "—"}/{sub.task.point}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 flex min-h-0 p-3 gap-3">
          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Editor Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-slate-400 font-medium font-mono">
                  {activeSubmission?.task.title || "Code"}.py
                </span>
              </div>
              {getStatusBadge(activeSubmission?.status || "DRAFT")}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              {activeSubmission ? (
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  language="python"
                  value={activeSubmission.code || "# No code submitted yet"}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto",
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Select a task to view code
                </div>
              )}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="w-72 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl shrink-0">
            {activeSubmission ? (
              <>
                {/* Student Info Header */}
                <div className="p-4 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                  <div className="flex items-center gap-3">
                    {activeStudent.user.avatar ? (
                      <img
                        src={activeStudent.user.avatar}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-700 shadow-lg"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {activeStudent.user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate text-sm">
                        {activeStudent.user.name || "Unknown"}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {activeSubmission.task.title} •{" "}
                        {activeSubmission.task.point} pts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* Grade Input */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      <FiAward size={14} className="text-amber-400" />
                      Grade
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={activeSubmission.task.point}
                        value={currentGrade}
                        onChange={(e) => setCurrentGrade(e.target.value)}
                        className="w-20 px-3 py-2.5 text-center text-lg font-bold text-white bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                      <span className="text-slate-500">/</span>
                      <span className="text-lg font-bold text-slate-300">
                        {activeSubmission.task.point}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Input */}
                  <div className="flex-1 flex flex-col">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      <FiMessageSquare size={14} className="text-blue-400" />
                      Feedback
                    </label>
                    <textarea
                      value={currentFeedback}
                      onChange={(e) => setCurrentFeedback(e.target.value)}
                      className="flex-1 min-h-[120px] w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-white resize-none transition-all placeholder:text-slate-500"
                      placeholder="Add feedback for the student..."
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                      saveSuccess
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <FiLoader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <FiCheckCircle size={16} />
                        Saved!
                      </>
                    ) : (
                      <>
                        <FiSend size={16} />
                        {activeSubmission.status === "RETURNED"
                          ? "Update Grade"
                          : "Return Grade"}
                      </>
                    )}
                  </button>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        selectedStudentIndex > 0 &&
                        handleSelectionChange(selectedStudentIndex - 1, 0)
                      }
                      disabled={selectedStudentIndex === 0}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    >
                      <FiChevronLeft size={14} />
                      Prev
                    </button>
                    <span className="text-xs text-slate-500">
                      {selectedStudentIndex + 1}/{filteredStudents.length}
                    </span>
                    <button
                      onClick={() =>
                        selectedStudentIndex < filteredStudents.length - 1 &&
                        handleSelectionChange(selectedStudentIndex + 1, 0)
                      }
                      disabled={
                        selectedStudentIndex === filteredStudents.length - 1
                      }
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    >
                      Next
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
                <FiFileText size={40} className="text-slate-700 mb-3" />
                <p className="text-sm">Select a submission to grade</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
