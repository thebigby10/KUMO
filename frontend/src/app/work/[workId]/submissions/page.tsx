import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";
import { GradingController } from "@/controller/GradingController";
import SubmissionDashboard from "./SubmissionDashboard";
/**
 * Teacher's Submission Dashboard Page
 * 
 * Shows all student submissions for a work assignment with:
 * - Stats cards (submitted, graded, in progress, not started)
 * - Student list with status indicators
 * - Links to grade individual submissions
 * 
 * Only accessible by instructors of the lab.
 */
export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) {
    redirect("/login");
  }

  try {
    const dashboardData = await GradingController.getSubmissionDashboard(
      workId,
      user.email,
    );

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Link
              href={`/dashboard/lab/${dashboardData.work.labId}/work`}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {dashboardData.work.title}
              </h1>
              <p className="text-sm text-gray-500">
                Student Submissions • {dashboardData.work.taskCount} Tasks • {dashboardData.work.totalPoints} Points
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto py-8 px-6">
          <SubmissionDashboard
            workId={workId}
            labId={dashboardData.work.labId}
            stats={dashboardData.stats}
            submissions={dashboardData.submissions}
            notStartedStudents={dashboardData.notStartedStudents}
            totalPoints={dashboardData.work.totalPoints}
            dueDate={dashboardData.work.endTime}
          />
        </main>
      </div>
    );
  } catch (error) {
    // If unauthorized or work not found
    console.error("Error loading submissions:", error);
    notFound();
  }
}
