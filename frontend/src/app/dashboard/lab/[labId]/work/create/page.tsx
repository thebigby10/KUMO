import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import CreateAssignmentForm from "@/components/classwork/CreateAssignmentForm";

export default async function CreateWorkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  // 1. Await params (Next.js 15+)
  const { labId } = await params;

  // 2. Auth Check
  const user = await getCurrentUser();
  if (!user?.email) {
    redirect("/"); // Redirect to login if session expired
  }

  // 3. Fetch Lab Data & Verify Existence
  const lab = await LabController.getById(labId);
  if (!lab) {
    notFound();
  }

  // 4. Permission Check (Must be Instructor/Owner)
  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );

  if (!isInstructor) {
    // Return a clean unauthorized UI or redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Unauthorized</h2>
        <p className="text-gray-600">
          You do not have permission to create assignments for this class.
        </p>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="text-blue-600 hover:underline"
        >
          Return to Class Stream
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Nav */}
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
              Create New Assignment
            </h1>
            <p className="text-xs text-gray-500">{lab.name}</p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <div className="max-w-5xl mx-auto py-8 px-6">
        <CreateAssignmentForm labId={labId} userEmail={user.email} />
      </div>
    </div>
  );
}
