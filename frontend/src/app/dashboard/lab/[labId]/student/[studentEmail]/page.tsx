import { notFound, redirect } from "next/navigation";
import { getStudentDashboardData } from "@/actions/student-dashboard";
import { getCurrentUser } from "@/actions/auth";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { LabRepository } from "@/repositories/LabRepository";
import StudentDashboard from "@/components/student-dashboard/StudentDashboard";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default async function StudentDashboardPage({
  params,
}: {
  params: Promise<{ labId: string; studentEmail: string }>;
}) {
  const { labId, studentEmail } = await params;
  const decodedEmail = decodeURIComponent(studentEmail);

  const user = await getCurrentUser();
  if (!user?.email) redirect("/");

  const instructor = await InstructorRepository.findByUserAndLab(user.email, labId);
  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Unauthorized Access</h1>
          <p className="text-gray-500 max-w-md">
            Only instructors can view student dashboards.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}/people`}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
        >
          Return to People
        </Link>
      </div>
    );
  }

  const lab = await LabRepository.findById(labId);
  if (!lab) notFound();

  const data = await getStudentDashboardData(labId, decodedEmail);

  if ("error" in data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-amber-50 rounded-2xl flex items-center justify-center">
          <span className="text-5xl">⚠️</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Unable to Load Dashboard</h1>
          <p className="text-gray-500">{data.error}</p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}/people`}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
        >
          Back to People
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/lab/${labId}/people`}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-sm text-gray-500">{lab.name}</p>
        </div>
      </div>

      <StudentDashboard
        student={data.student}
        stats={data.stats}
        works={data.works}
        joinedAt={data.joinedAt}
        labId={labId}
      />
    </div>
  );
}
