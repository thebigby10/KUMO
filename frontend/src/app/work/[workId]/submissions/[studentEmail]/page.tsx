import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";
import { GradingController } from "@/controller/GradingController";
import GradingView from "./GradingView";

/**
 * Individual Student Submission Page
 * 
 * Allows teachers to:
 * - View student's submitted code for each task
 * - Run test cases against student's code
 * - Assign grades and provide feedback
 * 
 * Only accessible by instructors of the lab.
 */
export default async function StudentSubmissionPage({
  params,
}: {
  params: Promise<{ workId: string; studentEmail: string }>;
}) {
  const { workId, studentEmail } = await params;
  const decodedEmail = decodeURIComponent(studentEmail);
  const user = await getCurrentUser();

  if (!user?.email) {
    redirect("/login");
  }

  try {
    const data = await GradingController.getStudentSubmission(
      workId,
      decodedEmail,
      user.email,
    );

    if (!data.submission) {
      // Student hasn't started yet - show placeholder
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b px-6 py-4 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <Link
                href={`/work/${workId}/submissions`}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              >
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Student Submission
                </h1>
                <p className="text-sm text-gray-500">{decodedEmail}</p>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto py-16 px-6">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <User size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Submission Yet
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                This student hasn&apos;t started working on this assignment yet.
                Check back later to view their submission.
              </p>
              <Link
                href={`/work/${workId}/submissions`}
                className="inline-block mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/work/${workId}/submissions`}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              >
                <ChevronLeft size={24} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {data.submission.user.avatar ? (
                    <img
                      src={data.submission.user.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    (data.submission.user.name?.[0] || decodedEmail[0]).toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {data.submission.user.name || "Unknown Student"}
                  </h1>
                  <p className="text-sm text-gray-500">{decodedEmail}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <StatusBadge status={data.submission.status} />
          </div>
        </header>

        {/* Grading View */}
        <main className="max-w-7xl mx-auto py-8 px-6">
          <GradingView
            workId={workId}
            submission={data.submission}
            tasks={data.work.tasks}
            totalPoints={data.work.totalPoints}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading submission:", error);
    notFound();
  }
}

function StatusBadge({ status }: { status: "DRAFT" | "SUBMITTED" | "RETURNED" }) {
  const config = {
    DRAFT: {
      label: "In Progress",
      classes: "bg-amber-100 text-amber-700 border-amber-200",
    },
    SUBMITTED: {
      label: "Submitted",
      classes: "bg-green-100 text-green-700 border-green-200",
    },
    RETURNED: {
      label: "Graded",
      classes: "bg-purple-100 text-purple-700 border-purple-200",
    },
  };

  const { label, classes } = config[status];

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${classes}`}>
      {label}
    </span>
  );
}
