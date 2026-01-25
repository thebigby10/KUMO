import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WorkRepository } from "@/repositories/WorkRepository"; // Use repository directly to fetch all nested data
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import CreateAssignmentForm from "@/components/classwork/CreateAssignmentForm";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ labId: string; workId: string }>;
}) {
  const { labId, workId } = await params;

  // 1. Auth Check
  const user = await getCurrentUser();
  if (!user?.email) {
    redirect("/");
  }

  // 2. Permission Check (Must be Instructor)
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

  // 3. Fetch Work Data (Detailed)
  const work = await WorkRepository.findById(workId);
  if (!work) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            title="Back to Classwork"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Edit Assignment
            </h1>
            <p className="text-xs text-gray-500">{lab.name}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-6">
        <CreateAssignmentForm
          labId={labId}
          userEmail={user.email}
          initialData={work}
        />
      </div>
    </div>
  );
}
