// src/app/dashboard/lab/[labId]/people/page.tsx

import { getPeople } from "@/actions/classroom-actions/lab";
import { FiUser, FiUsers } from "react-icons/fi";

const page = async ({ params }: { params: Promise<{ labId: string }> }) => {
  const { labId } = await params;

  if (!labId) {
    return <div className="p-6 text-red-500">Invalid lab ID</div>;
  }

  const peoples = await getPeople(labId);

  const teachers = peoples?.instructors || [];
  const students = peoples?.students || [];

  // Generate avatar gradient based on name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-red-500 to-orange-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-purple-500 to-pink-500",
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-green-500",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.name || teacher.email}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-600"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(
                      teacher.name || teacher.email
                    )} flex items-center justify-center text-white font-bold shadow-lg`}
                  >
                    {getInitials(teacher.name || teacher.email)}
                  </div>
                )}
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
              {students.map((student: any) => (
                <div
                  key={student.email}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
                >
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name || student.email}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-600"
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarGradient(
                        student.name || student.email
                      )} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {getInitials(student.name || student.email)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {student.name || student.email}
                    </p>
                    {student.name && (
                      <p className="text-sm text-slate-400">{student.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;