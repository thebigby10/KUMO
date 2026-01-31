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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <FiCheckCircle size={12} />
            Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FiClock size={12} />
            Submitted
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

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGradeColor = (grade: number | null, maxPoints: number) => {
    if (grade === null) return "text-slate-400";
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-emerald-600",
      "from-amber-500 to-orange-600",
      "from-red-500 to-rose-600",
      "from-cyan-500 to-teal-600",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name || student.email}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-700"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(
                  student.name || student.email
                )} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-slate-700`}
              >
                {(student.name || student.email)[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {student.name || "Unknown Student"}
              </h2>
              <p className="text-sm text-slate-400 truncate">{student.email}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <FiCalendar size={12} />
                Joined {formatDate(joinedAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<FiBook className="text-blue-400" size={20} />}
            label="Lab Works"
            value={stats.totalWorks}
            subtext={`${stats.totalTasks} tasks`}
          />
          <StatCard
            icon={<FiCheckCircle className="text-green-400" size={20} />}
            label="Submitted"
            value={stats.submittedTasks}
            subtext={`of ${stats.totalTasks} tasks`}
          />
          <StatCard
            icon={<FiAward className="text-amber-400" size={20} />}
            label="Points Earned"
            value={stats.earnedPoints}
            subtext={`of ${stats.totalPoints}`}
          />
          <StatCard
            icon={<FiTrendingUp className="text-purple-400" size={20} />}
            label="Overall"
            value={`${stats.percentage}%`}
            subtext={`${stats.gradedTasks} graded`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FiBook size={18} className="text-blue-400" />
              Lab Works & Submissions
            </h3>
          </div>

          {works.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiFileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">No lab works yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
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
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/30 transition-colors text-left"
                    >
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <FiChevronDown size={18} />
                        ) : (
                          <FiChevronRight size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {work.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {work.tasks.length} task{work.tasks.length !== 1 ? "s" : ""}{" "}
                          • Due {formatDate(work.endTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            allGraded
                              ? getGradeColor(workEarned, workTotal)
                              : "text-slate-400"
                          }`}
                        >
                          {allGraded ? workEarned : "—"}/{workTotal}
                        </p>
                        {allGraded && (
                          <p className="text-xs text-green-400 mt-0.5">Graded</p>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-900/50 border-t border-slate-700/50">
                        {work.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() =>
                              setSelectedTask({ workTitle: work.title, task })
                            }
                            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-700/30 transition-colors text-left border-b border-slate-700/30 last:border-b-0 ${
                              selectedTask?.task.id === task.id
                                ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                                : ""
                            }`}
                          >
                            <FiCode size={14} className="text-slate-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-300 truncate">
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

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col">
          {selectedTask ? (
            <>
              <div className="px-5 py-4 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      {selectedTask.workTitle}
                    </p>
                    <h3 className="font-semibold text-white">
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
                <div className="px-5 py-3 bg-blue-500/5 border-b border-slate-700">
                  <div className="flex items-start gap-2">
                    <FiMessageSquare
                      size={14}
                      className="text-blue-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">
                        Instructor Feedback
                      </p>
                      <p className="text-sm text-slate-300">
                        {selectedTask.task.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[300px]">
                <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
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
                <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/50 text-xs text-slate-500">
                  Submitted on {formatDate(selectedTask.task.submittedAt)}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl mb-4 flex items-center justify-center">
                <FiCode className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Select a Task
              </h3>
              <p className="text-sm text-slate-400 max-w-xs">
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
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}
