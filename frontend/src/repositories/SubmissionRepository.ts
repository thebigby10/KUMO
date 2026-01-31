import { db, SubmissionStatus } from "@/lib/prisma";

export class SubmissionRepository {
  static async findById(id: string) {
    return await db.submission.findUnique({
      where: { id },
    });
  }

  /**
   * Find a specific submission for a specific task and user
   */
  static async findByTask(taskId: string, userEmail: string) {
    return await db.submission.findUnique({
      where: {
        taskId_userEmail: { taskId, userEmail },
      },
      include: { task: true },
    });
  }

  /**
   * Get all submissions for a specific work (Assignment) for a specific user.
   * Use this to load the "Work Environment" which might have tabs for Task 1, Task 2, etc.
   */
  static async findAllForWork(workId: string, userEmail: string) {
    return await db.submission.findMany({
      where: {
        workId,
        userEmail,
      },
      include: {
        task: {
          include: { testCases: true }, // Need test cases for execution context
        },
      },
      orderBy: { task: { createdAt: "asc" } },
    });
  }

  /**
   * Save code (Upsert logic is handled by findByTask + update, or ensure creation in WorkRepo)
   * Since we auto-create drafts, we can usually just update.
   */
  static async updateCode(taskId: string, userEmail: string, code: string) {
    return await db.submission.update({
      where: {
        taskId_userEmail: { taskId, userEmail },
      },
      data: { code },
    });
  }

  static async updateStatus(
    taskId: string,
    userEmail: string,
    status: SubmissionStatus,
    submittedAt?: Date,
  ) {
    return await db.submission.update({
      where: {
        taskId_userEmail: { taskId, userEmail },
      },
      data: { status, submittedAt },
    });
  }

  static async grade(
    taskId: string,
    userEmail: string,
    grade: number,
    feedback?: string,
  ) {
    return await db.submission.update({
      where: {
        taskId_userEmail: { taskId, userEmail },
      },
      data: {
        grade,
        feedback,
        status: "RETURNED",
      },
    });
  }

  /**
   * Grade a submission by its ID (used by grading interface)
   */
  static async gradeById(
    submissionId: string,
    grade: number,
    feedback?: string,
  ) {
    return await db.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        status: "RETURNED",
      },
    });
  }

  /**
   * Get all submissions for a specific work (for instructor grading/dashboard view)
   */
  static async findAllByWorkId(workId: string) {
    return await db.submission.findMany({
      where: { workId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            point: true,
          },
        },
      },
      orderBy: [{ task: { createdAt: "asc" } }, { userEmail: "asc" }],
    });
  }

  /**
   * Get submission statistics for a work (for teacher dashboard)
   */
  static async getWorkStats(workId: string) {
    const submissions = await db.submission.findMany({
      where: { workId },
      select: {
        status: true,
        grade: true,
        userEmail: true,
        taskId: true,
        submittedAt: true,
      },
    });

    // Get unique students
    const uniqueStudents = new Set(submissions.map((s) => s.userEmail));
    const totalStudents = uniqueStudents.size;

    // Get unique tasks
    const uniqueTasks = new Set(submissions.map((s) => s.taskId));
    const totalTasks = uniqueTasks.size;

    // Count by status
    const statusCounts = {
      draft: submissions.filter((s) => s.status === "DRAFT").length,
      submitted: submissions.filter((s) => s.status === "SUBMITTED").length,
      returned: submissions.filter((s) => s.status === "RETURNED").length,
    };

    // Students who have submitted at least one task
    const studentsWithSubmissions = new Set(
      submissions.filter((s) => s.status !== "DRAFT").map((s) => s.userEmail),
    );

    // Students who have all tasks graded
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

    return {
      totalStudents,
      totalTasks,
      totalSubmissions: submissions.length,
      statusCounts,
      studentsStarted: studentsWithSubmissions.size,
      studentsNotStarted: totalStudents - studentsWithSubmissions.size,
      fullyGradedStudents,
      averageGrade,
    };
  }

  static async findAllByStudentAndLab(userEmail: string, labId: string) {
    return await db.submission.findMany({
      where: {
        userEmail,
        work: { labId },
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            totalPoints: true,
            startTime: true,
            endTime: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            point: true,
          },
        },
      },
      orderBy: [{ work: { createdAt: "desc" } }, { task: { createdAt: "asc" } }],
    });
  }

  static async getStudentLabStats(userEmail: string, labId: string) {
    const submissions = await db.submission.findMany({
      where: {
        userEmail,
        work: { labId },
      },
      include: {
        task: { select: { point: true } },
        work: { select: { id: true } },
      },
    });

    const workMap = new Map<
      string,
      { total: number; earned: number; submitted: number; graded: number }
    >();

    submissions.forEach((sub) => {
      const workId = sub.work.id;
      if (!workMap.has(workId)) {
        workMap.set(workId, { total: 0, earned: 0, submitted: 0, graded: 0 });
      }
      const stats = workMap.get(workId)!;
      stats.total += sub.task.point;
      if (sub.status !== "DRAFT") stats.submitted++;
      if (sub.status === "RETURNED") {
        stats.graded++;
        stats.earned += sub.grade || 0;
      }
    });

    let totalPoints = 0;
    let earnedPoints = 0;
    let totalTasks = submissions.length;
    let submittedTasks = 0;
    let gradedTasks = 0;

    workMap.forEach((stats) => {
      totalPoints += stats.total;
      earnedPoints += stats.earned;
      submittedTasks += stats.submitted;
      gradedTasks += stats.graded;
    });

    return {
      totalWorks: workMap.size,
      totalTasks,
      submittedTasks,
      gradedTasks,
      totalPoints,
      earnedPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    };
  }
}
