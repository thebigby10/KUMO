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
    <div className="min-h-screen bg-white">
      {/* Changed z-50 to z-10 so it's below navbar dropdowns but above content */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <div className="">
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
      </nav>

      <div className="max-w-[1000px] mx-auto p-6">{children}</div>
    </div>
  );
}