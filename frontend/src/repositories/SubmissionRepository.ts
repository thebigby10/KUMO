import { db } from "@/models/models";
import { SubmissionStatus } from "../../generated/prisma/client";

export class SubmissionRepository {
  // Find or create the container for a student's work
  static async findOrCreate(labWorkId: string, userEmail: string) {
    let submission = await db.submission.findUnique({
      where: { labWorkId_userEmail: { labWorkId, userEmail } },
    });

    if (!submission) {
      submission = await db.submission.create({
        data: { labWorkId, userEmail },
      });
    }
    return submission;
  }

  static async findById(id: string) {
    return await db.submission.findUnique({
      where: { id },
      include: { records: true, user: true },
    });
  }

  static async findAllByWorkId(labWorkId: string) {
    return await db.submission.findMany({
      where: { labWorkId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  }

  // Update specific code for a task
  static async upsertRecord(
    submissionId: string,
    taskId: string,
    code: string,
    language: string,
  ) {
    return await db.submissionRecord.upsert({
      where: {
        submissionId_taskId: { submissionId, taskId },
      },
      update: { code, language },
      create: { submissionId, taskId, code, language },
    });
  }

  static async getRecord(submissionId: string, taskId: string) {
    return await db.submissionRecord.findUnique({
      where: { submissionId_taskId: { submissionId, taskId } },
    });
  }

  static async updateStatus(
    id: string,
    status: SubmissionStatus,
    submittedAt?: Date,
  ) {
    return await db.submission.update({
      where: { id },
      data: { status, submittedAt },
    });
  }

  static async grade(id: string, grade: number, feedback?: string) {
    return await db.submission.update({
      where: { id },
      data: {
        grade,
        feedback,
        status: "RETURNED",
      },
    });
  }

  /**
   * Get all submissions for a work with detailed user info and records.
   * Used by the teacher dashboard to see all student submissions.
   */
  static async findAllByWorkIdWithDetails(labWorkId: string) {
    return await db.submission.findMany({
      where: { labWorkId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            avatar: true,
          },
        },
        records: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                point: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get submission stats for a work (counts by status).
   */
  static async getStatsByWorkId(labWorkId: string) {
    const [total, submitted, returned, draft] = await Promise.all([
      db.submission.count({ where: { labWorkId } }),
      db.submission.count({ where: { labWorkId, status: "SUBMITTED" } }),
      db.submission.count({ where: { labWorkId, status: "RETURNED" } }),
      db.submission.count({ where: { labWorkId, status: "DRAFT" } }),
    ]);

    return { total, submitted, returned, draft };
  }

  /**
   * Get a single submission with all details for grading view.
   */
  static async findByIdWithFullDetails(id: string) {
    return await db.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            avatar: true,
          },
        },
        records: {
          include: {
            task: {
              include: {
                testCases: true,
                editors: true,
              },
            },
          },
        },
        labWork: {
          select: {
            id: true,
            title: true,
            labId: true,
            totalPoints: true,
          },
        },
      },
    });
  }

  /**
   * Find submission by work and user email.
   */
  static async findByWorkAndUser(labWorkId: string, userEmail: string) {
    return await db.submission.findUnique({
      where: { labWorkId_userEmail: { labWorkId, userEmail } },
      include: {
        user: true,
        records: {
          include: {
            task: {
              include: {
                testCases: true,
                editors: true,
              },
            },
          },
        },
      },
    });
  }
}
