// src/app/dashboard/lab/[labId]/work/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiPlus,
  FiCalendar,
  FiCode,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiBarChart2,
} from "react-icons/fi";
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import WorkActionMenu from "@/components/classwork/WorkActionMenu";
import prisma from "@/lib/prisma";

export default async function ClassworkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // 1. Fetch Lab and Works
  const lab = await LabController.getWithWorks(labId);
  if (!lab) notFound();

  // 2. Fetch User's Submissions for this Lab
  const userSubmissions = await prisma.submission.findMany({
    where: {
      userEmail: user.email,
      work: { labId: labId },
    },
    select: {
      workId: true,
      status: true,
      grade: true,
    },
  });

  // 3. Permission Check
  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );

  const now = new Date();

  // --- Helper: Determine Assignment Lifecycle Status ---
  const getWorkLifecycle = (startTime: Date | null, endTime: Date | null) => {
    if (startTime && now < startTime) return "SCHEDULED";
    if (endTime && now > endTime) return "CLOSED";
    return "ACTIVE";
  };

  // --- Helper: Determine Student's Personal Status ---
  const getStudentStatus = (
    workId: string,
    totalTasks: number,
    endTime: Date | null,
  ) => {
    const subs = userSubmissions.filter((s) => s.workId === workId);
    const submittedCount = subs.filter((s) => s.status !== "DRAFT").length;
    const gradedCount = subs.filter((s) => s.status === "RETURNED").length;

    // Check if fully graded
    if (gradedCount === totalTasks && totalTasks > 0) {
      const totalScore = subs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
      return {
        label: "Graded",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
        score: totalScore,
      };
    }

    // Check submission progress
    if (submittedCount === totalTasks && totalTasks > 0) {
      return { label: "Turned In", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    }

    // Late/Missing check
    if (endTime && now > endTime && submittedCount < totalTasks) {
      return { label: "Missing", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    }

    if (submittedCount > 0) {
      return { label: "In Progress", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    }

    return { label: "Assigned", color: "bg-slate-700 text-slate-400 border-slate-600" };
  };

  // --- Sort Works: Active first, then by Due Date ---
  const sortedWorks = [...lab.works].sort((a, b) => {
    const statusA = getWorkLifecycle(a.startTime, a.endTime);
    const statusB = getWorkLifecycle(b.startTime, b.endTime);

    if (statusA === "ACTIVE" && statusB !== "ACTIVE") return -1;
    if (statusA !== "ACTIVE" && statusB === "ACTIVE") return 1;

    const dateA = a.endTime ? new Date(a.endTime).getTime() : Infinity;
    const dateB = b.endTime ? new Date(b.endTime).getTime() : Infinity;
    return dateA - dateB;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Classwork</h2>
          <p className="text-slate-400">
            {isInstructor
              ? "Manage assignments and track progress"
              : "View your upcoming and past assignments"}
          </p>
        </div>

        {isInstructor && (
          <Link
            href={`/dashboard/lab/${labId}/work/create`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 font-medium"
          >
            <FiPlus size={20} />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {sortedWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <FiCode size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No assignments yet
            </h3>
            <p className="text-slate-400 max-w-md">
              {isInstructor
                ? "Get started by creating the first coding assignment for your students."
                : "Your instructor hasn't posted any work yet."}
            </p>
          </div>
        ) : (
          sortedWorks.map((work) => {
            const lifecycle = getWorkLifecycle(work.startTime, work.endTime);
            const studentStatus = getStudentStatus(
              work.id,
              work.tasks.length,
              work.endTime,
            );

            const isLockedForStudent =
              !isInstructor && lifecycle === "SCHEDULED";

            const linkHref = isInstructor
              ? `/dashboard/lab/${labId}/work/${work.id}/dashboard`
              : `/work/${work.id}`;

            return (
              <div key={work.id} className="relative group">
                <Link
                  href={isLockedForStudent ? "#" : linkHref}
                  className={`block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 transition-all relative shadow-lg
                    ${
                      isLockedForStudent
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                    }
                  `}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Icon & Main Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-xl shrink-0 ${
                          isInstructor
                            ? "bg-purple-500/10 text-purple-400"
                            : studentStatus.label === "Turned In" ||
                                studentStatus.label === "Graded"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {isLockedForStudent ? (
                          <FiLock size={24} />
                        ) : (
                          <FiCode size={24} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {work.title}
                          </h3>

                          {/* Lifecycle Badges */}
                          {lifecycle === "CLOSED" && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-400 border border-slate-600">
                              CLOSED
                            </span>
                          )}
                          {lifecycle === "SCHEDULED" && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              SCHEDULED
                            </span>
                          )}
                        </div>

                        {work.description && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {work.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FiBarChart2 size={14} />
                            <span className="text-slate-400">
                              {work.tasks.length}{" "}
                              {work.tasks.length === 1 ? "Task" : "Tasks"}
                            </span>
                          </span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span className="text-slate-400">{work.totalPoints} Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Status & Dates */}
                    <div className="flex flex-col lg:items-end gap-3 lg:min-w-[200px]">
                      {/* INSTRUCTOR VIEW: Stats */}
                      {isInstructor ? (
                        <>
                          <div className="text-lg font-bold text-white">
                            {(work as any)._count?.submissions || 0} Submissions
                          </div>
                          {work.endTime && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <FiCalendar size={14} />
                              Due{" "}
                              {new Date(work.endTime).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric", year: "numeric" },
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        /* STUDENT VIEW: Personal Status */
                        <>
                          {/* Grade Display */}
                          {studentStatus.score !== undefined && (
                            <div className="text-2xl font-bold text-white">
                              {studentStatus.score}
                              <span className="text-slate-500">/{work.totalPoints}</span>
                            </div>
                          )}

                          {/* Status Badge */}
                          {!isLockedForStudent && (
                            <div
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${studentStatus.color}`}
                            >
                              {studentStatus.label === "Turned In" && (
                                <FiCheckCircle size={14} />
                              )}
                              {studentStatus.label === "Missing" && (
                                <FiAlertCircle size={14} />
                              )}
                              {studentStatus.label}
                            </div>
                          )}

                          {/* Due Date Indicator */}
                          {work.endTime && lifecycle !== "CLOSED" && (
                            <div
                              className={`flex items-center gap-2 text-xs ${
                                lifecycle === "ACTIVE" &&
                                new Date(work.endTime).getTime() -
                                  now.getTime() <
                                  86400000
                                  ? "text-red-400 font-semibold"
                                  : "text-slate-500"
                              }`}
                            >
                              <FiClock size={12} />
                              {lifecycle === "SCHEDULED" ? "Starts " : "Due "}
                              {lifecycle === "SCHEDULED"
                                ? new Date(work.startTime!).toLocaleDateString()
                                : new Date(work.endTime).toLocaleString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                    },
                                  )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Floating Action Menu for Instructors */}
                {isInstructor && (
                  <div className="absolute top-5 right-5">
                    <WorkActionMenu workId={work.id} labId={labId} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}