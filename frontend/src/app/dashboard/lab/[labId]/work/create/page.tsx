import { notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CreateAssignmentForm from "@/app/components/classwork/CreateAssignmentForm";
import { LabController } from "@/controller/LabController";

export default async function CreateWorkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // CONTROLLER CALL: Fetch lab to verify permissions
  const lab = await LabController.getById(labId);

  if (!lab) notFound();

  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );
  if (!isInstructor) {
    return (
      <div className="p-10 text-center text-red-600">Unauthorized Access</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">
            Create New Lab Work
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-6">
        <CreateAssignmentForm labId={labId} userEmail={user.email} />
      </div>
    </div>
  );
}
