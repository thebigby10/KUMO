import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";
import UserMenu from "@/app/components/UserMenu";
import { LabController } from "@/controller/LabController"; // Logic moved here

export default async function LabLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  // CONTROLLER CALL: Validate Lab Exists
  const lab = await LabController.getById(labId);

  if (!lab) notFound();

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            ☰
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-medium text-gray-800 hover:underline cursor-pointer">
              {lab.name}
            </h1>
            {lab.section && (
              <span className="text-xs text-gray-500">{lab.section}</span>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex h-full">
          <Link
            href={`/dashboard/lab/${labId}`}
            className="px-6 py-3 text-sm font-medium text-gray-900 border-b-4 border-blue-600 hover:bg-gray-50"
          >
            Stream
          </Link>
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            Classwork
          </Link>
          <Link
            href={`/dashboard/lab/${labId}/people`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            People
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Settings size={24} />
          </button>

          <UserMenu email={user?.email || ""} name={user?.name} />
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto p-6">{children}</div>
    </div>
  );
}
