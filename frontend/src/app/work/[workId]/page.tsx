import { notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import CodeEditorPage from "@/app/editor-page/page";
import { WorkController } from "@/controller/WorkController"; // Logic moved here

export default async function WorkEnvPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // CONTROLLER CALL: Fetch the specific assignment
  const work = await WorkController.getWorkById(workId);

  if (!work || work.tasks.length === 0) notFound();

  // Extract Data for the Editor
  const task = work.tasks[0];
  const starterCode = task.editors[0]?.solution || "";
  const language = task.url || "python";

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a1a1a]">
      <CodeEditorPage
        initialCode={starterCode}
        initialLanguage={language}
        description={task.description || "No description provided."}
        title={task.title}
        workId={workId}
      />
    </div>
  );
}
