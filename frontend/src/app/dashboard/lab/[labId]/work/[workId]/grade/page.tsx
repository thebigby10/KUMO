import { notFound, redirect } from "next/navigation";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { WorkRepository } from "@/repositories/WorkRepository";
import { getCurrentUser } from "@/actions/auth";
import GradingInterface from "@/components/grading/GradingInterface";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600">
          Only instructors can access the grading dashboard.
        </p>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="text-blue-600 hover:underline"
        >
          Return to Class
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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Compact Header for Grading Mode */}
      <header className="h-14 px-4 border-b flex items-center justify-between bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            title="Back to Classwork"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-semibold text-slate-800 leading-tight">
              {work.title}
            </h1>
            <p className="text-xs text-slate-400">Grading Dashboard</p>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
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
