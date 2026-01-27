"use client";

import { useState, useMemo, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Send,
  FileText,
  Award,
  MessageSquare,
  User2,
  Loader2,
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
    s.tasks.every((t) => t.status === "RETURNED")
  ).length;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
            <FileText size={12} />
            Draft
          </span>
        );
    }
  };

  if (!activeStudent)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
        <User2 size={48} className="text-gray-300 mb-4" />
        <p className="text-lg font-medium">No students found</p>
        <p className="text-sm">There are no submissions to grade yet.</p>
      </div>
    );

  return (
    <div className="flex h-full bg-slate-50">
      {/* LEFT PANEL: Students List */}
      <div className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Search & Stats Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {gradedStudents} of {totalStudents} graded
            </span>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
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
              (t) => t.status === "RETURNED"
            );
            const totalPoints = student.tasks.reduce(
              (sum, t) => sum + t.task.point,
              0
            );
            const earnedPoints = student.tasks.reduce(
              (sum, t) => sum + (t.grade || 0),
              0
            );

            return (
              <button
                key={student.user.email}
                onClick={() => handleSelectionChange(idx, 0)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2 ${
                  isSelected
                    ? "bg-blue-50/80 border-l-blue-600"
                    : "border-l-transparent hover:bg-slate-50"
                }`}
              >
                {/* Avatar */}
                {student.user.avatar ? (
                  <img
                    src={student.user.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                      isSelected
                        ? "bg-blue-600"
                        : "bg-gradient-to-br from-slate-400 to-slate-500"
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
                        isSelected ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      {student.user.name || "Unknown Student"}
                    </p>
                    {allGraded && (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 truncate">
                      {student.tasks.length} tasks
                    </span>
                    {allGraded && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-medium text-emerald-600">
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
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-2 gap-1 overflow-x-auto shrink-0">
          {activeStudent.tasks.map((sub, idx) => {
            const isTaskSelected = idx === selectedTaskIndex;
            const isGraded = sub.status === "RETURNED";

            return (
              <button
                key={sub.taskId}
                onClick={() => handleSelectionChange(selectedStudentIndex, idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap mx-1 ${
                  isTaskSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="truncate max-w-[120px]">{sub.task.title}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                    isTaskSelected
                      ? "bg-white/20 text-white"
                      : isGraded
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {sub.grade !== null ? sub.grade : "—"}/{sub.task.point}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 flex min-h-0 p-2 gap-2">
          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {/* Editor Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm text-slate-500 font-medium">
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
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
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
                <div className="flex items-center justify-center h-full text-slate-400">
                  Select a task to view code
                </div>
              )}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="w-64 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm shrink-0">
            {activeSubmission ? (
              <>
                {/* Student Info Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center gap-3">
                    {activeStudent.user.avatar ? (
                      <img
                        src={activeStudent.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow">
                        {activeStudent.user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate text-sm">
                        {activeStudent.user.name || "Unknown"}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {activeSubmission.task.title} • {activeSubmission.task.point} pts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* Grade Input */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      <Award size={14} className="text-amber-500" />
                      Grade
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={activeSubmission.task.point}
                        value={currentGrade}
                        onChange={(e) => setCurrentGrade(e.target.value)}
                        className="w-16 px-2 py-2 text-center text-base font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                      <span className="text-slate-400">/</span>
                      <span className="text-base font-semibold text-slate-600">
                        {activeSubmission.task.point}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Input */}
                  <div className="flex-1 flex flex-col">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      <MessageSquare size={14} className="text-blue-500" />
                      Feedback
                    </label>
                    <textarea
                      value={currentFeedback}
                      onChange={(e) => setCurrentFeedback(e.target.value)}
                      className="flex-1 min-h-[100px] w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm resize-none transition-all placeholder:text-slate-300"
                      placeholder="Add feedback for the student..."
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      saveSuccess
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle2 size={16} />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {activeSubmission.status === "RETURNED"
                          ? "Update"
                          : "Return"}
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
                      className="flex items-center gap-0.5 px-2 py-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>
                    <span className="text-xs text-slate-400">
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
                      className="flex items-center gap-0.5 px-2 py-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
                <FileText size={40} className="text-slate-200 mb-3" />
                <p className="text-sm">Select a submission to grade</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
