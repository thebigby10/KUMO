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
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 space-y-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Unauthorized Access</h1>
          <p className="text-slate-400 max-w-md">
            Only instructors can access this dashboard.
          </p>
        </div>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/lab/${labId}/work`}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Back to Classwork"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{work.title}</h1>
                {isScheduled && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    SCHEDULED
                  </span>
                )}
                {isActive && !isClosed && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                    ACTIVE
                  </span>
                )}
                {isClosed && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 text-slate-400 border border-slate-600">
                    CLOSED
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">Teacher Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              <FiEdit size={16} />
              Edit Assignment
            </Link>
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/grade`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <FiClipboard size={16} />
              Grade Submissions
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 space-y-6">
        {/* Assignment Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Total Points</p>
              <p className="text-4xl font-bold text-white">
                {work.totalPoints}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              {work.startTime && (
                <div className="flex items-center gap-2 text-slate-400">
                  <FiCalendar size={16} className="text-slate-500" />
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
                <div className="flex items-center gap-2 text-slate-400">
                  <FiClock size={16} className="text-slate-500" />
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
              <div className="flex items-center gap-2 text-slate-400">
                <FiBarChart2 size={16} className="text-slate-500" />
                <span>{work.tasks.length} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <FiUsers className="text-blue-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Enrolled in this lab</p>
          </div>

          {/* Submitted */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Turned In</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.studentsStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <FiFileText className="text-green-400" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Turn-in Rate</span>
                <span className="font-semibold text-white">
                  {submissionRate}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Not Started */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Not Started
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.studentsNotStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="text-amber-400" size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Haven&apos;t submitted any task yet
            </p>
          </div>

          {/* Graded */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Fully Graded
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.fullyGradedStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Grading Progress</span>
                <span className="font-semibold text-white">
                  {gradingProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
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
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 shadow-2xl">
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
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">
            Submission Status Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <div>
                <p className="text-3xl font-bold text-white">
                  {stats.statusCounts.draft}
                </p>
                <p className="text-sm text-slate-400 mt-1">Not Turned In</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-3xl font-bold text-white">
                  {stats.statusCounts.submitted}
                </p>
                <p className="text-sm text-slate-400 mt-1">Awaiting Grade</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-3xl font-bold text-white">
                  {stats.statusCounts.returned}
                </p>
                <p className="text-sm text-slate-400 mt-1">Graded & Returned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Student Progress</h2>
            <span className="text-sm text-slate-400">
              {studentList.length} students
            </span>
          </div>

          {studentList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FiUsers size={40} className="text-slate-500" />
              </div>
              <p className="text-slate-400">No students enrolled yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {studentList.map((student) => (
                <div
                  key={student.user.email}
                  className="px-6 py-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {student.user.name?.[0]?.toUpperCase() ||
                          student.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {student.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-400">
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
                                  ? "bg-green-400"
                                  : task.status === "SUBMITTED"
                                    ? "bg-blue-400"
                                    : "bg-slate-600"
                              }`}
                              title={`${task.taskTitle}: ${task.status}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
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
                          <p className="text-lg font-bold text-white">
                            {student.totalGrade}
                            <span className="text-slate-500">
                              /{student.maxPossible}
                            </span>
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                            <FiClock size={14} />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="w-28">
                        {student.allGraded ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <FiCheckCircle size={12} />
                            Graded
                          </span>
                        ) : student.allSubmitted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <FiFileText size={12} />
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-slate-400 border border-slate-600">
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
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">Tasks Overview</h2>
          </div>
          <div className="divide-y divide-slate-700/50">
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
                  className="px-6 py-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-sm text-slate-400">
                          {task.point} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-white text-lg">
                          {submitted}
                        </p>
                        <p className="text-xs text-slate-500">Submitted</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-lg">{graded}</p>
                        <p className="text-xs text-slate-500">Graded</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-lg">
                          {stats.totalStudents - submitted}
                        </p>
                        <p className="text-xs text-slate-500">Pending</p>
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