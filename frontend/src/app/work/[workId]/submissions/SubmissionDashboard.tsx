"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  FileEdit,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
} from "lucide-react";

// Types from the controller
interface SubmissionUser {
  email: string;
  name: string | null;
  avatar: string | null;
}

interface SubmissionRecord {
  id: string;
  code: string;
  language: string;
  task: {
    id: string;
    title: string;
    point: number;
  };
}

interface Submission {
  id: string;
  userEmail: string;
  status: "DRAFT" | "SUBMITTED" | "RETURNED";
  grade: number | null;
  feedback: string | null;
  submittedAt: Date | null;
  user: SubmissionUser;
  records: SubmissionRecord[];
}

interface Stats {
  total: number;
  submitted: number;
  returned: number;
  draft: number;
  notStarted: number;
  enrolled: number;
}

interface SubmissionDashboardProps {
  workId: string;
  labId: string;
  stats: Stats;
  submissions: Submission[];
  notStartedStudents: SubmissionUser[];
  totalPoints: number;
  dueDate: Date | null;
}

type FilterType = "all" | "submitted" | "returned" | "draft" | "not-started";

export default function SubmissionDashboard({
  workId,
  labId,
  stats,
  submissions,
  notStartedStudents,
  totalPoints,
  dueDate,
}: SubmissionDashboardProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "grade">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and search logic
  const filteredSubmissions = submissions.filter((sub) => {
    // Search filter
    const matchesSearch =
      sub.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    if (filter === "all") return matchesSearch;
    if (filter === "submitted") return matchesSearch && sub.status === "SUBMITTED";
    if (filter === "returned") return matchesSearch && sub.status === "RETURNED";
    if (filter === "draft") return matchesSearch && sub.status === "DRAFT";
    return matchesSearch;
  });

  const filteredNotStarted = notStartedStudents.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return filter === "all" || filter === "not-started" ? matchesSearch : false;
  });

  // Sort logic
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = (a.user.name || a.userEmail).localeCompare(
        b.user.name || b.userEmail
      );
    } else if (sortBy === "status") {
      const statusOrder = { RETURNED: 0, SUBMITTED: 1, DRAFT: 2 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    } else if (sortBy === "grade") {
      comparison = (a.grade || 0) - (b.grade || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const toggleSort = (column: "name" | "status" | "grade") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: "name" | "status" | "grade" }) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="ml-1" />
    ) : (
      <ChevronDown size={14} className="ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Enrolled"
          value={stats.enrolled}
          icon={<Users size={20} />}
          color="blue"
        />
        <StatCard
          label="Submitted"
          value={stats.submitted}
          icon={<CheckCircle2 size={20} />}
          color="green"
          onClick={() => setFilter("submitted")}
          active={filter === "submitted"}
        />
        <StatCard
          label="Graded"
          value={stats.returned}
          icon={<FileEdit size={20} />}
          color="purple"
          onClick={() => setFilter("returned")}
          active={filter === "returned"}
        />
        <StatCard
          label="In Progress"
          value={stats.draft}
          icon={<Clock size={20} />}
          color="yellow"
          onClick={() => setFilter("draft")}
          active={filter === "draft"}
        />
        <StatCard
          label="Not Started"
          value={stats.notStarted}
          icon={<AlertCircle size={20} />}
          color="red"
          onClick={() => setFilter("not-started")}
          active={filter === "not-started"}
        />
      </div>

      {/* Due Date Banner (if set) */}
      {dueDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <Calendar className="text-amber-600" size={20} />
          <span className="text-amber-800">
            Due: {new Date(dueDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <FilterPill
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterPill
              label="Submitted"
              active={filter === "submitted"}
              onClick={() => setFilter("submitted")}
              color="green"
            />
            <FilterPill
              label="Graded"
              active={filter === "returned"}
              onClick={() => setFilter("returned")}
              color="purple"
            />
            <FilterPill
              label="In Progress"
              active={filter === "draft"}
              onClick={() => setFilter("draft")}
              color="yellow"
            />
            <FilterPill
              label="Not Started"
              active={filter === "not-started"}
              onClick={() => setFilter("not-started")}
              color="red"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Student
                    <SortIcon column="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon column="status" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => toggleSort("grade")}
                >
                  <div className="flex items-center">
                    Grade
                    <SortIcon column="grade" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Submissions with records */}
              {sortedSubmissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  workId={workId}
                  totalPoints={totalPoints}
                />
              ))}

              {/* Not started students */}
              {(filter === "all" || filter === "not-started") &&
                filteredNotStarted.map((student) => (
                  <NotStartedRow key={student.email} student={student} />
                ))}

              {/* Empty State */}
              {sortedSubmissions.length === 0 &&
                filteredNotStarted.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users size={40} className="text-gray-300" />
                        <p>No students match your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({
  label,
  value,
  icon,
  color,
  onClick,
  active,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "yellow" | "red";
  onClick?: () => void;
  active?: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    yellow: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  const activeClasses = {
    blue: "ring-2 ring-blue-500",
    green: "ring-2 ring-green-500",
    purple: "ring-2 ring-purple-500",
    yellow: "ring-2 ring-amber-500",
    red: "ring-2 ring-red-500",
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition
        ${colorClasses[color]}
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${active ? activeClasses[color] : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: "green" | "purple" | "yellow" | "red";
}) {
  const baseClasses =
    "px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer";
  const activeClasses = color
    ? {
        green: "bg-green-100 text-green-700 border border-green-300",
        purple: "bg-purple-100 text-purple-700 border border-purple-300",
        yellow: "bg-amber-100 text-amber-700 border border-amber-300",
        red: "bg-red-100 text-red-700 border border-red-300",
      }[color]
    : "bg-blue-100 text-blue-700 border border-blue-300";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${
        active
          ? activeClasses
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function SubmissionRow({
  submission,
  workId,
  totalPoints,
}: {
  submission: Submission;
  workId: string;
  totalPoints: number;
}) {
  const statusConfig = {
    DRAFT: {
      label: "In Progress",
      color: "bg-amber-100 text-amber-700",
      icon: <Clock size={14} />,
    },
    SUBMITTED: {
      label: "Submitted",
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle2 size={14} />,
    },
    RETURNED: {
      label: "Graded",
      color: "bg-purple-100 text-purple-700",
      icon: <FileEdit size={14} />,
    },
  };

  const status = statusConfig[submission.status];
  const tasksCompleted = submission.records.length;

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {submission.user.avatar ? (
              <img
                src={submission.user.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              (submission.user.name?.[0] || submission.userEmail[0]).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {submission.user.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-500">{submission.userEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(tasksCompleted * 25, 100)}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">{tasksCompleted} tasks</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {submission.grade !== null ? (
          <span className="font-semibold text-gray-900">
            {submission.grade}/{totalPoints}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/work/${workId}/submissions/${encodeURIComponent(submission.userEmail)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {submission.status === "SUBMITTED" ? "Grade" : "View"}
        </Link>
      </td>
    </tr>
  );
}

function NotStartedRow({ student }: { student: SubmissionUser }) {
  return (
    <tr className="hover:bg-gray-50 transition bg-gray-50/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            <User size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-600">
              {student.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          <AlertCircle size={14} />
          Not Started
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full" />
          <span className="text-sm text-gray-400">0 tasks</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-400">—</span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="text-sm text-gray-400">No submission</span>
      </td>
    </tr>
  );
}
