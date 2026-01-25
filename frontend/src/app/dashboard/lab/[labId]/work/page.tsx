import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Calendar, FileCode, Users, Eye } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";
import { LabController } from "@/controller/LabController";

export default async function ClassworkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // CONTROLLER CALL: Fetch Lab with LabWorks
  const lab = await LabController.getWithWorks(labId);

  if (!lab) notFound();

  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Classwork</h2>

        {isInstructor && (
          <Link
            href={`/dashboard/lab/${labId}/work/create`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={20} />
            <span>Create</span>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {lab.labWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileCode size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No assignments yet
            </h3>
            {isInstructor && (
              <p className="text-sm text-gray-500 mt-2">
                Create your first assignment to get started
              </p>
            )}
          </div>
        ) : (
          lab.labWorks.map((work) => {
            // Route based on role:
            // - Instructors → Submission Dashboard (/work/[id]/submissions)
            // - Students → Code Editor (/work/[id])
            const workUrl = isInstructor
              ? `/work/${work.id}/submissions`
              : `/work/${work.id}`;

            return (
              <Link
                key={work.id}
                href={workUrl}
                className="group block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                      <FileCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {work.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {work.tasks.length}{" "}
                        {work.tasks.length === 1 ? "Task" : "Tasks"} •{" "}
                        {work.totalPoints} Points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {work.endTime && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar size={14} />
                        Due {new Date(work.endTime).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Role indicator pill */}
                    <div
                      className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full ${
                        isInstructor
                          ? "bg-purple-50 text-purple-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {isInstructor ? (
                        <>
                          <Users size={14} />
                          View Submissions
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Start Work
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
