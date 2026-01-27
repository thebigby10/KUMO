import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  BarChart3,
  Edit3,
  ClipboardList,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
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
    labId
  );

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600">
          Only instructors can access this dashboard.
        </p>
        <Link
          href={`/dashboard/lab/${labId}`}
          className="text-blue-600 hover:underline"
        >
          Return to Class
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
    (sub) => !instructorEmails.has(sub.userEmail)
  );

  // Calculate stats from filtered submissions only
  const totalStudents = enrollments.length;
  const uniqueStudentsWithSubmissions = new Set(
    submissions.filter((s) => s.status !== "DRAFT").map((s) => s.userEmail)
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
    (s) => s.status === "RETURNED" && s.grade !== null
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
  const isActive = work.startTime && work.endTime 
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
    (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email)
  );

  // Calculate submission rate
  const submissionRate = stats.totalStudents > 0 
    ? Math.round((stats.studentsStarted / stats.totalStudents) * 100)
    : 0;

  // Calculate grading progress
  const gradingProgress = stats.totalSubmissions > 0
    ? Math.round((stats.statusCounts.returned / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/lab/${labId}/work`}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              title="Back to Classwork"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-800">
                  {work.title}
                </h1>
                {isScheduled && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    Scheduled
                  </span>
                )}
                {isActive && !isClosed && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    Active
                  </span>
                )}
                {isClosed && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Teacher Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit3 size={16} />
              Edit Assignment
            </Link>
            <Link
              href={`/dashboard/lab/${labId}/work/${workId}/grade`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <ClipboardList size={16} />
              Grade Submissions
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 space-y-8">
        {/* Assignment Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-3xl font-bold text-gray-900">
                {work.totalPoints}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              {work.startTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
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
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
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
              <div className="flex items-center gap-2 text-gray-600">
                <BarChart3 size={16} className="text-gray-400" />
                <span>{work.tasks.length} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Enrolled in this lab
            </p>
          </div>

          {/* Submitted */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.studentsStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <FileCheck className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Submission Rate</span>
                <span className="font-semibold text-gray-700">
                  {submissionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Not Started */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Not Started</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.studentsNotStarted}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Haven&apos;t submitted any task yet
            </p>
          </div>

          {/* Graded */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fully Graded
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.fullyGradedStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Grading Progress</span>
                <span className="font-semibold text-gray-700">
                  {gradingProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${gradingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Average Grade Card */}
        {stats.averageGrade !== null && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} />
                  <p className="text-sm font-medium text-blue-100">
                    Class Average
                  </p>
                </div>
                <p className="text-4xl font-bold">
                  {stats.averageGrade.toFixed(1)}
                </p>
                <p className="text-sm text-blue-200 mt-1">
                  Based on {stats.statusCounts.returned} graded submissions
                </p>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Award size={40} className="text-white/80" />
              </div>
            </div>
          </div>
        )}

        {/* Submission Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Submission Status Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusCounts.draft}
                </p>
                <p className="text-sm text-gray-500">Draft</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusCounts.submitted}
                </p>
                <p className="text-sm text-gray-500">Submitted</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusCounts.returned}
                </p>
                <p className="text-sm text-gray-500">Graded & Returned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Student Progress
            </h2>
            <span className="text-sm text-gray-500">
              {studentList.length} students
            </span>
          </div>

          {studentList.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No students enrolled yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {studentList.map((student) => (
                <div
                  key={student.user.email}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
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
                        <p className="text-xs text-gray-500 mt-1">
                          {student.tasks.filter((t) => t.status !== "DRAFT").length}/
                          {student.tasks.length} submitted
                        </p>
                      </div>

                      {/* Grade */}
                      <div className="w-24 text-right">
                        {student.allGraded ? (
                          <p className="text-lg font-bold text-gray-900">
                            {student.totalGrade}/{student.maxPossible}
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={14} />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="w-28">
                        {student.allGraded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 size={12} />
                            Graded
                          </span>
                        ) : student.allSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <FileCheck size={12} />
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Clock size={12} />
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
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Tasks Overview
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {work.tasks.map((task, index) => {
              const taskSubmissions = submissions.filter(
                (s) => s.taskId === task.id
              );
              const submitted = taskSubmissions.filter(
                (s) => s.status !== "DRAFT"
              ).length;
              const graded = taskSubmissions.filter(
                (s) => s.status === "RETURNED"
              ).length;

              return (
                <div key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
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
                        <p className="font-semibold text-gray-900">{submitted}</p>
                        <p className="text-xs text-gray-500">Submitted</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{graded}</p>
                        <p className="text-xs text-gray-500">Graded</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {stats.totalStudents - submitted}
                        </p>
                        <p className="text-xs text-gray-500">Pending</p>
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
