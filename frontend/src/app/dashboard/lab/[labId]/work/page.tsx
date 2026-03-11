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
        color: "bg-green-50 text-green-600 border-green-200",
        score: totalScore,
      };
    }

    // Check submission progress
    if (submittedCount === totalTasks && totalTasks > 0) {
      return { label: "Turned In", color: "bg-blue-50 text-blue-600 border-blue-200" };
    }

    // Late/Missing check
    if (endTime && now > endTime && submittedCount < totalTasks) {
      return { label: "Missing", color: "bg-red-50 text-red-600 border-red-200" };
    }

    if (submittedCount > 0) {
      return { label: "In Progress", color: "bg-yellow-50 text-yellow-600 border-yellow-200" };
    }

    return { label: "Assigned", color: "bg-gray-100 text-gray-500 border-gray-200" };
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Classwork</h2>
          <p className="text-gray-500">
            {isInstructor
              ? "Manage assignments and track progress"
              : "View your upcoming and past assignments"}
          </p>
        </div>

        {isInstructor && (
          <Link
            href={`/dashboard/lab/${labId}/work/create`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm font-medium"
          >
            <FiPlus size={20} />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {sortedWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <div className="w-20 h-20 bg-pink-50 text-pink-400 rounded-2xl flex items-center justify-center mb-6">
              <FiCode size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No assignments yet
            </h3>
            <p className="text-gray-500 max-w-md">
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
                  className={`block bg-white border border-gray-200 rounded-xl p-6 transition-all relative shadow-sm
                    ${
                      isLockedForStudent
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-pink-200 hover:shadow-md cursor-pointer"
                    }
                  `}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Icon & Main Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-xl shrink-0 ${
                          isInstructor
                            ? "bg-purple-50 text-purple-500"
                            : studentStatus.label === "Turned In" ||
                                studentStatus.label === "Graded"
                              ? "bg-green-50 text-green-500"
                              : "bg-pink-50 text-pink-500"
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
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-500 transition-colors">
                            {work.title}
                          </h3>

                          {/* Lifecycle Badges */}
                          {lifecycle === "CLOSED" && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              CLOSED
                            </span>
                          )}
                          {lifecycle === "SCHEDULED" && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-500 border border-orange-200">
                              SCHEDULED
                            </span>
                          )}
                        </div>

                        {work.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {work.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <FiBarChart2 size={14} />
                            <span className="text-gray-500">
                              {work.tasks.length}{" "}
                              {work.tasks.length === 1 ? "Task" : "Tasks"}
                            </span>
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-500">{work.totalPoints} Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Status & Dates */}
                    <div className="flex flex-col lg:items-end gap-3 lg:min-w-[200px]">
                      {/* INSTRUCTOR VIEW: Stats */}
                      {isInstructor ? (
                        <>
                          <div className="text-lg font-bold text-gray-900">
                            {(work as any)._count?.submissions || 0} Submissions
                          </div>
                          {work.endTime && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                            <div className="text-2xl font-bold text-gray-900">
                              {studentStatus.score}
                              <span className="text-gray-400">/{work.totalPoints}</span>
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
                                  ? "text-red-500 font-semibold"
                                  : "text-gray-400"
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