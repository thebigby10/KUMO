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
            <h2 className="text-2xl font-bold text-white">Instructors</h2>
            <p className="text-sm text-slate-400">{teachers.length} instructor{teachers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          {teachers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No instructors found
            </div>
          ) : (
            teachers.map((teacher: any, index: number) => (
              <div
                key={teacher.email}
                className={`flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors ${
                  index !== teachers.length - 1 ? "border-b border-slate-700/50" : ""
                }`}
              >
                <Avatar
                  name={teacher.name}
                  email={teacher.email}
                  avatar={teacher.avatar}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {teacher.name || teacher.email}
                  </p>
                  {teacher.name && (
                    <p className="text-sm text-slate-400">{teacher.email}</p>
                  )}
                </div>
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-xs font-medium text-indigo-400">
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
            <h2 className="text-2xl font-bold text-white">Students</h2>
            <p className="text-sm text-slate-400">{students.length} student{students.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiUsers className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No students yet
              </h3>
              <p className="text-sm text-slate-400">
                Students will appear here once they join the lab
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
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
                      <p className="text-white font-medium">
                        {student.name || student.email}
                      </p>
                      {student.name && (
                        <p className="text-sm text-slate-400">{student.email}</p>
                      )}
                    </div>
                    {isInstructor && (
                      <FiChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    )}
                  </>
                );

                return isInstructor ? (
                  <Link
                    key={student.email}
                    href={`/dashboard/lab/${labId}/student/${encodeURIComponent(student.email)}`}
                    className="group flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
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