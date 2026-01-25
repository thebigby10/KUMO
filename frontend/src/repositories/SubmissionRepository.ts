import { db } from "@/models/models";
import { SubmissionStatus } from "@prisma/client";

export class SubmissionRepository {
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
}
