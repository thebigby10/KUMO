import { notFound, redirect } from "next/navigation";
import CodeEditorPage from "@/app/editor-page/page";
import { WorkController } from "@/controller/WorkController";
import { getCurrentUser } from "@/actions/auth";
import { initializeWorkSession } from "@/actions/submission";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";

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

  // --- Requirement 3: Start Time Check ---
  const now = new Date();
  if (work.startTime && now < new Date(work.startTime)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Assignment Locked</h1>
        <p className="text-gray-600 mt-2">
          This assignment starts on {new Date(work.startTime).toLocaleString()}
        </p>
      </div>
    );
  }

  // --- Requirement 1: Initialize Session (Create Submissions) ---
  const initResult = await initializeWorkSession(workId);
  if (initResult.error) {
    return (
      <div className="p-10 text-center text-red-500">{initResult.error}</div>
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
        endTime={work.endTime ? work.endTime.toISOString() : null} // Pass End Time
      />
    </div>
  );
}
