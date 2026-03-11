import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiBarChart2,
  FiEdit,
  FiClipboard,
  FiTrendingUp,
  FiCalendar,
  FiAward,
} from "react-icons/fi";
import { WorkRepository } from "@/repositories/WorkRepository";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { getCurrentUser } from "@/actions/auth";

export default async function TeacherDashboardPage({
  params,
}: {
  params: Promise<{ labId: string; workId: string }>;
}) {
  const { labId, workId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) redirect("/");

  // 1. Permission Check - Must be Instructor
  const instructor = await InstructorRepository.findByUserAndLab(
    user.email,
    labId,
  );

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 space-y-6">
        <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Unauthorized Access</h1>
          <p className="text-gray-500 max-w-md">
            Only instructors can access this dashboard.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
        >
          Return to Lab
        </Link>
      </div>
    );
  }

  // 2. Fetch Data
  const work = await WorkRepository.findById(workId);
  if (!work) notFound();

  const allSubmissions = await SubmissionRepository.findAllByWorkId(workId);
  const enrollments = await EnrollmentRepository.findAllByLabId(labId);
  const instructors = await InstructorRepository.findAllByLabId(labId);

  // Get instructor emails to filter them out
  const instructorEmails = new Set(instructors.map((i) => i.userEmail));

  // Filter submissions to only include enrolled students (not instructors)
  const submissions = allSubmissions.filter(
    (sub) => !instructorEmails.has(sub.userEmail),
  );

  // Calculate stats from filtered submissions only
  const totalStudents = enrollments.length;
  const uniqueStudentsWithSubmissions = new Set(
    submissions.filter((s) => s.status !== "DRAFT").map((s) => s.userEmail),
  );
  const studentsStarted = uniqueStudentsWithSubmissions.size;
  const studentsNotStarted = totalStudents - studentsStarted;

  const statusCounts = {
    draft: submissions.filter((s) => s.status === "DRAFT").length,
    submitted: submissions.filter((s) => s.status === "SUBMITTED").length,
    returned: submissions.filter((s) => s.status === "RETURNED").length,
  };

  // Calculate fully graded students
  const studentTaskGrades = new Map<string, number>();
  const studentTaskCount = new Map<string, number>();

  submissions.forEach((s) => {
    const count = studentTaskCount.get(s.userEmail) || 0;
    studentTaskCount.set(s.userEmail, count + 1);

    if (s.status === "RETURNED") {
      const graded = studentTaskGrades.get(s.userEmail) || 0;
      studentTaskGrades.set(s.userEmail, graded + 1);
    }
  });

  let fullyGradedStudents = 0;
  studentTaskGrades.forEach((gradedCount, email) => {
    const totalForStudent = studentTaskCount.get(email) || 0;
    if (gradedCount === totalForStudent && totalForStudent > 0) {
      fullyGradedStudents++;
    }
  });

  // Average grade (only for graded submissions)
  const gradedSubmissions = submissions.filter(
    (s) => s.status === "RETURNED" && s.grade !== null,
  );
  const averageGrade =
    gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) /
        gradedSubmissions.length
      : null;

  const stats = {
    totalStudents,
    totalTasks: work.tasks.length,
    totalSubmissions: submissions.length,
    statusCounts,
    studentsStarted,
    studentsNotStarted,
    fullyGradedStudents,
    averageGrade,
  };

  // 3. Calculate Additional Metrics
  const now = new Date();
  const isActive =
    work.startTime && work.endTime
      ? now >= work.startTime && now <= work.endTime
      : true;
  const isClosed = work.endTime ? now > work.endTime : false;
  const isScheduled = work.startTime ? now < work.startTime : false;

  // Group submissions by student for detailed view
  const studentSubmissions = new Map<
    string,
    {
      user: { name: string | null; email: string; avatar: string | null };
      tasks: Array<{
        taskId: string;
        taskTitle: string;
        status: string;
        grade: number | null;
        maxPoints: number;
        submittedAt: Date | null;
      }>;
      totalGrade: number;
      maxPossible: number;
      allSubmitted: boolean;
      allGraded: boolean;
    }
  >();

  submissions.forEach((sub) => {
    if (!studentSubmissions.has(sub.userEmail)) {
      studentSubmissions.set(sub.userEmail, {
        user: sub.user,
        tasks: [],
        totalGrade: 0,
        maxPossible: 0,
        allSubmitted: true,
        allGraded: true,
      });
    }

    const student = studentSubmissions.get(sub.userEmail)!;
    student.tasks.push({
      taskId: sub.taskId,
      taskTitle: sub.task.title,
      status: sub.status,
      grade: sub.grade,
      maxPoints: sub.task.point,
      submittedAt: sub.submittedAt,
    });

    student.maxPossible += sub.task.point;
    if (sub.grade !== null) {
      student.totalGrade += sub.grade;
    }
    if (sub.status === "DRAFT") {
      student.allSubmitted = false;
    }
    if (sub.status !== "RETURNED") {
      student.allGraded = false;
    }
  });

  // Convert to array and sort
  const studentList = Array.from(studentSubmissions.values()).sort((a, b) =>
    (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email),
  );

  // Calculate submission rate
  const submissionRate =
    stats.totalStudents > 0
      ? Math.round((stats.studentsStarted / stats.totalStudents) * 100)
      : 0;

  // Calculate grading progress
  const gradingProgress =
    stats.totalSubmissions > 0
      ? Math.round((stats.statusCounts.returned / stats.totalSubmissions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/lab/${labId}/work`}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              title="Back to Classwork"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{work.title}</h1>
                {isScheduled && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                    SCHEDULED
                  </span>
                )}
                {isActive && !isClosed && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                    ACTIVE
                  </span>
                )}
                {isClosed && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    CLOSED
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Teacher Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <FiEdit size={16} />
              Edit Assignment
            </Link>
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/grade`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/20"
            >
              <FiClipboard size={16} />
              Grade Submissions
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 space-y-6">
        {/* Assignment Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Points</p>
              <p className="text-4xl font-bold text-gray-900">
                {work.totalPoints}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              {work.startTime && (
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCalendar size={16} className="text-gray-400" />
                  <span>
                    Starts:{" "}
                    {new Date(work.startTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {work.endTime && (
                <div className="flex items-center gap-2 text-gray-500">
                  <FiClock size={16} className="text-gray-400" />
                  <span>
                    Due:{" "}
                    {new Date(work.endTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500">
                <FiBarChart2 size={16} className="text-gray-400" />
                <span>{work.tasks.length} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiUsers className="text-blue-500" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Enrolled in this lab</p>
          </div>

          {/* Submitted */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Turned In</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.studentsStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <FiFileText className="text-green-500" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Turn-in Rate</span>
                <span className="font-semibold text-gray-900">
                  {submissionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Not Started */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Not Started
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.studentsNotStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="text-amber-500" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Haven&apos;t submitted any task yet
            </p>
          </div>

          {/* Graded */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fully Graded
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.fullyGradedStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Grading Progress</span>
                <span className="font-semibold text-gray-900">
                  {gradingProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${gradingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Average Grade Card */}
        {stats.averageGrade !== null && (
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp size={20} className="text-blue-100" />
                  <p className="text-sm font-medium text-blue-100">
                    Class Average
                  </p>
                </div>
                <p className="text-5xl font-bold text-white">
                  {stats.averageGrade.toFixed(1)}
                </p>
                <p className="text-sm text-blue-200 mt-2">
                  Based on {stats.statusCounts.returned} graded submissions
                </p>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FiAward size={40} className="text-white/80" />
              </div>
            </div>
          </div>
        )}

        {/* Submission Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Submission Status Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.statusCounts.draft}
                </p>
                <p className="text-sm text-gray-500 mt-1">Not Turned In</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.statusCounts.submitted}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting Grade</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.statusCounts.returned}
                </p>
                <p className="text-sm text-gray-500 mt-1">Graded & Returned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Student Progress</h2>
            <span className="text-sm text-gray-500">
              {studentList.length} students
            </span>
          </div>

          {studentList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiUsers size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No students enrolled yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {studentList.map((student) => (
                <div
                  key={student.user.email}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {student.user.name?.[0]?.toUpperCase() ||
                          student.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Task Progress */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {student.tasks.map((task) => (
                            <div
                              key={task.taskId}
                              className={`w-2.5 h-2.5 rounded-full ${
                                task.status === "RETURNED"
                                  ? "bg-green-500"
                                  : task.status === "SUBMITTED"
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                              }`}
                              title={`${task.taskTitle}: ${task.status}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {
                            student.tasks.filter((t) => t.status !== "DRAFT")
                              .length
                          }
                          /{student.tasks.length} submitted
                        </p>
                      </div>

                      {/* Grade */}
                      <div className="w-24 text-right">
                        {student.allGraded ? (
                          <p className="text-lg font-bold text-gray-900">
                            {student.totalGrade}
                            <span className="text-gray-400">
                              /{student.maxPossible}
                            </span>
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                            <FiClock size={14} />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="w-28">
                        {student.allGraded ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                            <FiCheckCircle size={12} />
                            Graded
                          </span>
                        ) : student.allSubmitted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                            <FiFileText size={12} />
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            <FiClock size={12} />
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Overview */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Tasks Overview</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {work.tasks.map((task, index) => {
              const taskSubmissions = submissions.filter(
                (s) => s.taskId === task.id,
              );
              const submitted = taskSubmissions.filter(
                (s) => s.status !== "DRAFT",
              ).length;
              const graded = taskSubmissions.filter(
                (s) => s.status === "RETURNED",
              ).length;

              return (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {task.point} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">
                          {submitted}
                        </p>
                        <p className="text-xs text-gray-400">Submitted</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">{graded}</p>
                        <p className="text-xs text-gray-400">Graded</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">
                          {stats.totalStudents - submitted}
                        </p>
                        <p className="text-xs text-gray-400">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}