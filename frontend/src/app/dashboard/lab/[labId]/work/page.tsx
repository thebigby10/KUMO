import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plus,
  Calendar,
  FileCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  BarChart3,
} from "lucide-react";
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

  // 2. Fetch User's Submissions for this Lab (to calculate progress)
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
      // Calculate average or total grade if needed, here just returning status
      const totalScore = subs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
      return {
        label: "Graded",
        color: "bg-green-100 text-green-700",
        score: totalScore,
      };
    }

    // Check submission progress
    if (submittedCount === totalTasks && totalTasks > 0) {
      return { label: "Turned In", color: "bg-blue-100 text-blue-700" };
    }

    // Late/Missing check
    if (endTime && now > endTime && submittedCount < totalTasks) {
      return { label: "Missing", color: "bg-red-100 text-red-700" };
    }

    if (submittedCount > 0) {
      return { label: "In Progress", color: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Assigned", color: "bg-gray-100 text-gray-600" };
  };

  // --- Sort Works: Active first, then by Due Date ---
  const sortedWorks = [...lab.works].sort((a, b) => {
    const statusA = getWorkLifecycle(a.startTime, a.endTime);
    const statusB = getWorkLifecycle(b.startTime, b.endTime);

    // Active works go to top
    if (statusA === "ACTIVE" && statusB !== "ACTIVE") return -1;
    if (statusA !== "ACTIVE" && statusB === "ACTIVE") return 1;

    // Then sort by due date (closest first)
    const dateA = a.endTime ? new Date(a.endTime).getTime() : Infinity;
    const dateB = b.endTime ? new Date(b.endTime).getTime() : Infinity;
    return dateA - dateB;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Classwork</h2>
          <p className="text-sm text-gray-500">
            {isInstructor
              ? "Manage assignments and track progress"
              : "View your upcoming and past assignments"}
          </p>
        </div>

        {isInstructor && (
          <Link
            href={`/dashboard/lab/${labId}/work/create`}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={20} />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {sortedWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileCode size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No assignments yet
            </h3>
            <p className="text-gray-500 mt-2 max-w-sm">
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

            // Logic for access
            const isLockedForStudent =
              !isInstructor && lifecycle === "SCHEDULED";

            // Link Destination - Instructors go to dashboard, students go to work
            const linkHref = isInstructor
              ? `/dashboard/lab/${labId}/work/${work.id}/dashboard`
              : `/work/${work.id}`;

            return (
              <div key={work.id} className="relative group">
                <Link
                  href={isLockedForStudent ? "#" : linkHref}
                  className={`block bg-white border border-gray-200 rounded-xl p-5 transition relative
                    ${
                      isLockedForStudent
                        ? "opacity-60 cursor-not-allowed bg-gray-50"
                        : "hover:border-blue-400 hover:shadow-md cursor-pointer"
                    }
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Icon & Main Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg transition shrink-0 ${
                          isInstructor
                            ? "bg-purple-50 text-purple-600"
                            : studentStatus.label === "Turned In" ||
                                studentStatus.label === "Graded"
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {isLockedForStudent ? (
                          <Lock size={24} />
                        ) : (
                          <FileCode size={24} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                            {work.title}
                          </h3>

                          {/* Lifecycle Badges */}
                          {lifecycle === "CLOSED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                              Closed
                            </span>
                          )}
                          {lifecycle === "SCHEDULED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wide border border-orange-200">
                              Scheduled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <BarChart3 size={14} />
                            {work.tasks.length}{" "}
                            {work.tasks.length === 1 ? "Task" : "Tasks"}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                          <span>{work.totalPoints} Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Status & Dates */}
                    <div className="flex flex-col sm:items-end gap-2">
                      {/* INSTRUCTOR VIEW: Stats */}
                      {isInstructor ? (
                        <div className="flex flex-col sm:items-end gap-1">
                          <div className="text-sm font-medium text-gray-700">
                            {(work as any)._count?.submissions || 0} Submissions
                          </div>
                          {work.endTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              Due{" "}
                              {new Date(work.endTime).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* STUDENT VIEW: Personal Status */
                        <div className="flex flex-col sm:items-end gap-2">
                          {/* Grade Display */}
                          {studentStatus.score !== undefined && (
                            <div className="text-lg font-bold text-gray-900">
                              {studentStatus.score}/{work.totalPoints}
                            </div>
                          )}

                          {/* Status Badge */}
                          {!isLockedForStudent && (
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium w-fit ${studentStatus.color}`}
                            >
                              {studentStatus.label === "Turned In" && (
                                <CheckCircle2 size={12} />
                              )}
                              {studentStatus.label === "Missing" && (
                                <AlertCircle size={12} />
                              )}
                              {studentStatus.label}
                            </div>
                          )}

                          {/* Due Date Indicator */}
                          {work.endTime && lifecycle !== "CLOSED" && (
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                lifecycle === "ACTIVE" &&
                                new Date(work.endTime).getTime() -
                                  now.getTime() <
                                  86400000
                                  ? "text-red-600 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              <Clock size={12} />
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
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Floating Action Menu for Instructors */}
                {isInstructor && (
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
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
