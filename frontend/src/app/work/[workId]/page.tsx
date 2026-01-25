// src/app/work/[workId]/page.tsx

import { notFound } from "next/navigation";
import CodeEditorPage from "@/app/editor-page/page";
import { WorkController } from "@/controller/WorkController";
import { getCurrentUser } from "@/actions/auth";

export default async function WorkEnvPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const work = await WorkController.getWorkById(workId);

  console.log("Fetched work:", work);

  if (!work || work.tasks.length === 0) notFound();

  // Transform tasks to match the CodeEditorPage interface
  const tasks = work.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "No description provided.",
    initialCode: task.editors[0].solution || "",
    initialLanguage: task.url || "python",
  }));

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a1a1a]">
      <CodeEditorPage tasks={tasks} workId={workId} />
    </div>
  );
}