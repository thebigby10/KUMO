"use client";

import { useState } from "react";
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiTrendingUp,
  FiBook,
  FiChevronDown,
  FiChevronRight,
  FiMessageSquare,
  FiCode,
} from "react-icons/fi";
import Editor from "@monaco-editor/react";
import Avatar from "@/components/Avatar";

interface StudentDashboardProps {
  student: {
    email: string;
    name: string | null;
    avatar: string | null;
  };
  stats: {
    totalWorks: number;
    totalTasks: number;
    submittedTasks: number;
    gradedTasks: number;
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
  };
  works: Array<{
    id: string;
    title: string;
    totalPoints: number;
    startTime: Date | null;
    endTime: Date | null;
    tasks: Array<{
      id: string;
      title: string;
      point: number;
      submissionId: string;
      status: string;
      grade: number | null;
      feedback: string | null;
      submittedAt: Date | null;
      code: string;
      language: string;
    }>;
  }>;
  joinedAt: Date;
  labId: string;
}

export default function StudentDashboard({
  student,
  stats,
  works,
  joinedAt,
  labId,
}: StudentDashboardProps) {
  const [expandedWorks, setExpandedWorks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<{
    workTitle: string;
    task: StudentDashboardProps["works"][0]["tasks"][0];
  } | null>(null);

  const toggleWork = (workId: string) => {
    const newExpanded = new Set(expandedWorks);
    if (newExpanded.has(workId)) {
      newExpanded.delete(workId);
    } else {
      newExpanded.add(workId);
    }
    setExpandedWorks(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
            <FiCheckCircle size={12} />
            Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            <FiClock size={12} />
            Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            <FiFileText size={12} />
            Draft
          </span>
        );
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGradeColor = (grade: number | null, maxPoints: number) => {
    if (grade === null) return "text-gray-400";
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <Avatar
                name={student.name}
                email={student.email}
                avatar={student.avatar}
                size="lg"
                className="!w-16 !h-16 !ring-4 !ring-gray-100"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {student.name || "Unknown Student"}
              </h2>
              <p className="text-sm text-gray-500 truncate">{student.email}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <FiCalendar size={12} />
                Joined {formatDate(joinedAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<FiBook className="text-blue-500" size={20} />}
            label="Lab Works"
            value={stats.totalWorks}
            subtext={`${stats.totalTasks} tasks`}
          />
          <StatCard
            icon={<FiCheckCircle className="text-green-500" size={20} />}
            label="Submitted"
            value={stats.submittedTasks}
            subtext={`of ${stats.totalTasks} tasks`}
          />
          <StatCard
            icon={<FiAward className="text-amber-500" size={20} />}
            label="Points Earned"
            value={stats.earnedPoints}
            subtext={`of ${stats.totalPoints}`}
          />
          <StatCard
            icon={<FiTrendingUp className="text-purple-500" size={20} />}
            label="Overall"
            value={`${stats.percentage}%`}
            subtext={`${stats.gradedTasks} graded`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiBook size={18} className="text-blue-500" />
              Lab Works & Submissions
            </h3>
          </div>

          {works.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No lab works yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {works.map((work) => {
                const isExpanded = expandedWorks.has(work.id);
                const workEarned = work.tasks.reduce(
                  (sum, t) => sum + (t.grade || 0),
                  0
                );
                const workTotal = work.tasks.reduce((sum, t) => sum + t.point, 0);
                const allGraded = work.tasks.every((t) => t.status === "RETURNED");

                return (
                  <div key={work.id}>
                    <button
                      onClick={() => toggleWork(work.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="text-gray-400">
                        {isExpanded ? (
                          <FiChevronDown size={18} />
                        ) : (
                          <FiChevronRight size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {work.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {work.tasks.length} task{work.tasks.length !== 1 ? "s" : ""}{" "}
                          • Due {formatDate(work.endTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            allGraded
                              ? getGradeColor(workEarned, workTotal)
                              : "text-gray-400"
                          }`}
                        >
                          {allGraded ? workEarned : "—"}/{workTotal}
                        </p>
                        {allGraded && (
                          <p className="text-xs text-green-600 mt-0.5">Graded</p>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100">
                        {work.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() =>
                              setSelectedTask({ workTitle: work.title, task })
                            }
                            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100 last:border-b-0 ${
                              selectedTask?.task.id === task.id
                                ? "bg-pink-50 border-l-2 border-l-pink-500"
                                : ""
                            }`}
                          >
                            <FiCode size={14} className="text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate">
                                {task.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(task.status)}
                              <span
                                className={`text-sm font-semibold ${getGradeColor(
                                  task.grade,
                                  task.point
                                )}`}
                              >
                                {task.grade !== null ? task.grade : "—"}/{task.point}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {selectedTask ? (
            <>
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {selectedTask.workTitle}
                    </p>
                    <h3 className="font-semibold text-gray-900">
                      {selectedTask.task.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedTask.task.status)}
                    <span
                      className={`text-lg font-bold ${getGradeColor(
                        selectedTask.task.grade,
                        selectedTask.task.point
                      )}`}
                    >
                      {selectedTask.task.grade !== null
                        ? selectedTask.task.grade
                        : "—"}
                      /{selectedTask.task.point}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTask.task.feedback && (
                <div className="px-5 py-3 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-start gap-2">
                    <FiMessageSquare
                      size={14}
                      className="text-blue-500 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        Instructor Feedback
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedTask.task.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[300px]">
                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {selectedTask.task.title}.{selectedTask.task.language}
                  </span>
                </div>
                <Editor
                  height="300px"
                  language={selectedTask.task.language || "python"}
                  value={selectedTask.task.code || "// No code submitted"}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
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
              </div>

              {selectedTask.task.submittedAt && (
                <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                  Submitted on {formatDate(selectedTask.task.submittedAt)}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
                <FiCode className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a Task
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Click on any task from the list to view the student&apos;s submission
                and feedback
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-400">{subtext}</p>
    </div>
  );
}
