//src/app/dashboard/lab/[labId]/layout.tsx

import { notFound } from "next/navigation";
import { LabController } from "@/controller/LabController";
import NavTab from "../components/NavTab";

export default async function LabLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;

  const lab = await LabController.getById(labId);

  if (!lab) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Modern Tab Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 py-1">
            <NavTab href={`/dashboard/lab/${labId}`} labId={labId}>
              Stream
            </NavTab>
            <NavTab href={`/dashboard/lab/${labId}/work`} labId={labId}>
              Classwork
            </NavTab>
            <NavTab href={`/dashboard/lab/${labId}/people`} labId={labId}>
              People
            </NavTab>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">{children}</div>
    </div>
  );
}