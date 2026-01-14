import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import CodeEditorPage from "@/app/editor-page/page"; // Your robust Client Component

export default async function WorkEnvPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // 1. Fetch the Assignment and its Tasks
  const work = await prisma.labWork.findUnique({
    where: { id: workId },
    include: {
      tasks: {
        include: {
          editors: true, // Get the starter code
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!work || work.tasks.length === 0) notFound();

  // 2. Extract Data for the Editor
  // (Currently handling single-task labs, but built to expand)
  const task = work.tasks[0];
  const starterCode = task.editors[0]?.solution || "";
  const language = task.url || "python"; // Stored in 'url' field temporarily

  // 3. Render the Full Screen Page
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