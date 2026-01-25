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

  // CONTROLLER CALL: Validate Lab Exists
  const lab = await LabController.getById(labId);

  if (!lab) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Lab-specific navigation tabs */}
      <nav className="flex items-center border-b bg-white sticky top-0 z-40">
        <div className="flex items-center gap-4 px-6 py-2">
          <div className="flex flex-col">
            <h1 className="text-lg font-medium text-gray-800">
              {lab.name}
            </h1>
            {lab.section && (
              <span className="text-xs text-gray-500">{lab.section}</span>
            )}
          </div>
        </div>

        <div className="flex ml-auto">
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
