// src/app/dashboard/lab/[labId]/work/create/page.tsx

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import CreateAssignmentForm from "@/components/classwork/CreateAssignmentForm";

export default async function CreateWorkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;

  // Auth Check
  const user = await getCurrentUser();
  if (!user?.email) {
    redirect("/");
  }

  // Fetch Lab Data & Verify Existence
  const lab = await LabController.getById(labId);
  if (!lab) {
    notFound();
  }

  // Permission Check (Must be Instructor/Owner)
  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );

  if (!isInstructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Unauthorized Access</h2>
          <p className="text-gray-500 max-w-md">
            You do not have permission to create assignments for this lab.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
        >
          Return to Lab Stream
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
            title="Back to Classwork"
          >
            <FiChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Create New Assignment
            </h1>
            <p className="text-sm text-gray-500">{lab.name}</p>
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