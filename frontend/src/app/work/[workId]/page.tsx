// src/app/work/[workId]/page.tsx

import { notFound, redirect } from "next/navigation";
import CodeEditorPage from "@/app/editor-page/page";
import { WorkController } from "@/controller/WorkController";
import { getCurrentUser } from "@/actions/auth";
import { initializeWorkSession } from "@/actions/submission";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { FiLock, FiClock } from "react-icons/fi";
import Link from "next/link";

export default async function WorkEnvPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) redirect("/");

  const work = await WorkController.getWorkById(workId);
  if (!work || work.tasks.length === 0) notFound();

  // Start Time Check
  const now = new Date();
  if (work.startTime && now < new Date(work.startTime)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-orange-500/10 rounded-2xl mx-auto flex items-center justify-center">
            <FiLock className="w-12 h-12 text-orange-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Assignment Locked</h1>
            <p className="text-slate-400">
              This assignment will be available on:
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-white">
              <FiClock className="w-5 h-5 text-blue-400" />
              {new Date(work.startTime).toLocaleString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          </div>
          <Link
            href={`/dashboard/lab/${work.labId}/work`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            Back to Classwork
          </Link>
        </div>
      </div>
    );
  }

  // Initialize Session (Create Submissions)
  const initResult = await initializeWorkSession(workId);
  if (initResult.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center">
            <span className="text-5xl">⚠️</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Error</h1>
            <p className="text-red-400">{initResult.error}</p>
          </div>
          <Link
            href={`/dashboard/lab/${work.labId}/work`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            Back to Classwork
          </Link>
        </div>
      </div>
    );
  }

  // Fetch fresh submissions to get the saved code
  const submissions = await SubmissionRepository.findAllForWork(
    workId,
    user.email,
  );

  // Map tasks merging fresh submission code
  const tasks = work.tasks.map((task) => {
    const sub = submissions.find((s) => s.taskId === task.id);
    return {
      id: task.id,
      title: task.title,
      description: task.description || "No description.",
      // Use existing submission code if available, else starter code
      initialCode: sub?.code || task.editors[0]?.solution || "",
      url: task.url || "",
    };
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a1a1a]">
      <CodeEditorPage
        tasks={tasks}
        workId={workId}
        endTime={work.endTime ? work.endTime.toISOString() : null}
      />
    </div>
  );
}