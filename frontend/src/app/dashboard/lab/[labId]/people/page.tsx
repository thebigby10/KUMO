import { getPeople } from "@/actions/classroom-actions/lab";
import { getCurrentUser } from "@/actions/auth";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { FiUser, FiUsers, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import Avatar from "@/components/Avatar";

const page = async ({ params }: { params: Promise<{ labId: string }> }) => {
  const { labId } = await params;

  if (!labId) {
    return <div className="p-6 text-red-500">Invalid lab ID</div>;
  }

  const user = await getCurrentUser();
  const isInstructor = user?.email
    ? await InstructorRepository.findByUserAndLab(user.email, labId)
    : null;

  const peoples = await getPeople(labId);

  const teachers = peoples?.instructors || [];
  const students = peoples?.students || [];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Teachers Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Instructors</h2>
            <p className="text-sm text-gray-500">{teachers.length} instructor{teachers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {teachers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No instructors found
            </div>
          ) : (
            teachers.map((teacher: any, index: number) => (
              <div
                key={teacher.email}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== teachers.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Avatar
                  name={teacher.name}
                  email={teacher.email}
                  avatar={teacher.avatar}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {teacher.name || teacher.email}
                  </p>
                  {teacher.name && (
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                  )}
                </div>
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                  <span className="text-xs font-medium text-indigo-600">
                    {teacher.role || "OWNER"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Students Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <FiUsers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <p className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiUsers className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No students yet
              </h3>
              <p className="text-sm text-gray-500">
                Students will appear here once they join the lab
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((student: any) => {
                const studentCard = (
                  <>
                    <Avatar
                      name={student.name}
                      email={student.email}
                      avatar={student.avatar}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {student.name || student.email}
                      </p>
                      {student.name && (
                        <p className="text-sm text-gray-500">{student.email}</p>
                      )}
                    </div>
                    {isInstructor && (
                      <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-700 transition-colors" />
                    )}
                  </>
                );

                return isInstructor ? (
                  <Link
                    key={student.email}
                    href={`/dashboard/lab/${labId}/student/${encodeURIComponent(student.email)}`}
                    className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {studentCard}
                  </Link>
                ) : (
                  <div
                    key={student.email}
                    className="flex items-center gap-4 p-4"
                  >
                    {studentCard}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;