import { getPeople } from "@/actions/classroom-actions/lab";

const page = async ({ params }: { params: { labId: string } }) => {
  let labId = "";
  try {
    labId = await params.labId;
  } catch (error) {
    console.error("Error fetching lab ID:", error);
  }

  const peoples = await getPeople(labId);

  console.log("Peoples data:", peoples?.students);

  // Extract teachers and students from the response
  const teachers = peoples?.instructors || [];
  const students = peoples?.students || [];

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Teachers Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-normal text-gray-800">Teachers</h2>
        </div>

        <div className="border-t border-gray-200">
          {teachers.map((teacher: any, index: number) => (
            <div
              key={teacher.id || index}
              className="flex items-center gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(teacher.name)} flex items-center justify-center text-white font-medium`}
                >
                  {getInitials(teacher.name)}
                </div>
              )}
              <span className="text-gray-800 text-sm">{teacher.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Classmates Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-normal text-gray-800">Classmates</h2>

          <span className="text-sm text-gray-600">
            {students.length} students
          </span>
        </div>

        <div className="border-t border-gray-200">
          {students.map((student: any, index: number) => (
            <div
              key={student.id || index}
              className="flex items-center gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {student.avatar ? (
                <img
                  src={student?.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white font-medium`}
                >
                  {getInitials(student.name)}
                </div>
              )}
              <span className="text-gray-800 text-sm">{student.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
