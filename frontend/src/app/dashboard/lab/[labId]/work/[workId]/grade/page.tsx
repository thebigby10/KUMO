import { notFound, redirect } from "next/navigation";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { WorkRepository } from "@/repositories/WorkRepository";
import { getCurrentUser } from "@/actions/auth";
import GradingInterface from "@/components/grading/GradingInterface";
import Link from "next/link";
import { FiArrowLeft, FiClipboard } from "react-icons/fi";

export default async function GradingPage({
  params,
}: {
  params: Promise<{ labId: string; workId: string }>;
}) {
  const { labId, workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) redirect("/");

  // 1. Permission Check
  const instructor = await InstructorRepository.findByUserAndLab(
    user.email,
    labId,
  );
  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 space-y-6">
        <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Unauthorized Access</h1>
          <p className="text-gray-500 max-w-md">
            Only instructors can access the grading dashboard.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
        >
          Return to Lab
        </Link>
      </div>
    );
  }

  // 2. Fetch Data
  const work = await WorkRepository.findById(workId);
  if (!work) notFound();

  // Fetch ALL submissions for this work (includes User and Task details)
  const submissions = await SubmissionRepository.findAllByWorkId(workId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Compact Header for Grading Mode */}
      <header className="h-14 px-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
            title="Back to Classwork"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              {work.title}
            </h1>
            <p className="text-xs text-gray-500">Grading Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
          <FiClipboard size={14} />
          {submissions.length} Submissions
        </div>
      </header>

      {/* Main Interface - Full Width */}
      <div className="flex-1 overflow-hidden">
        <GradingInterface
          submissions={submissions}
          labId={labId}
          workId={workId}
        />
      </div>
    </div>
  );
}
