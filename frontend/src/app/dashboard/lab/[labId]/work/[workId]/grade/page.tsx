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
    <div className="flex flex-col h-screen bg-white">
      {/* Custom Header for Grading Mode */}
      <header className="h-16 px-6 border-b flex items-center justify-between bg-white z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
            title="Back to Classwork"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 leading-tight">
              {work.title}
            </h1>
            <p className="text-xs text-gray-500">Grading Dashboard</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {submissions.length} Tasks Found
        </div>
      </header>

      {/* Main Interface */}
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
