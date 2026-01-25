import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Calendar, FileCode } from "lucide-react";
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import WorkActionMenu from "@/components/classwork/WorkActionMenu";

export default async function ClassworkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

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
        {lab.works.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileCode size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No assignments yet
            </h3>
            {isInstructor && (
              <p className="text-gray-500 mt-2">
                Click the create button to add assignments.
              </p>
            )}
          </div>
        ) : (
          lab.works.map((work) => {
            // Determine Link destination based on Role
            // Instructors go to Edit page, Students go to Solve page
            const linkHref = isInstructor
              ? `/dashboard/lab/${labId}/work/${work.id}/edit`
              : `/work/${work.id}`;

            return (
              <Link
                key={work.id}
                href={linkHref}
                className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition cursor-pointer relative"
              >
                <div className="flex items-start justify-between">
                  {/* Left Side: Icon & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-lg transition ${
                        isInstructor
                          ? "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }`}
                    >
                      <FileCode size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {work.title}
                      </h3>

                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>
                          {work.tasks.length}{" "}
                          {work.tasks.length === 1 ? "Problem" : "Problems"}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{work.totalPoints} Points</span>

                        {/* Instructor: Show Submission Count */}
                        {isInstructor && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-gray-600 font-medium">
                              {(work as any)._count?.submissions || 0}{" "}
                              Submissions
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Date & Actions */}
                  <div className="flex items-center gap-3">
                    {/* NEW: Grading Button for Instructors */}
                    {isInstructor && (
                      <Link
                        href={`/dashboard/lab/${labId}/work/${work.id}/grade`}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering the main card link
                        className="hidden sm:flex text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition"
                      >
                        Grade
                      </Link>
                    )}

                    {work.endTime && (
                      <div className="hidden sm:flex text-xs text-gray-500 items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Calendar size={14} />
                        {new Date(work.endTime) < new Date() ? "Due " : "Due "}
                        {new Date(work.endTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}

                    {/* Instructor Actions Dropdown (Edit/Delete) */}
                    {isInstructor && (
                      <WorkActionMenu workId={work.id} labId={labId} />
                    )}
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
