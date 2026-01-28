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
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-slate-400 max-w-md">
            You do not have permission to create assignments for this lab.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
        >
          Return to Lab Stream
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header / Nav */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/lab/${labId}/work`}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Back to Classwork"
          >
            <FiChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              Create New Assignment
            </h1>
            <p className="text-sm text-slate-400">{lab.name}</p>
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