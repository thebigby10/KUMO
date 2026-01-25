import { db } from "@/models/models";
import { SubmissionStatus } from "@prisma/client";

export class SubmissionRepository {
  // Find or create the container for a student's work
  static async findOrCreate(workId: string, userEmail: string) {
    let submission = await db.submission.findUnique({
      where: { workId_userEmail: { workId, userEmail } },
    });

    if (!submission) {
      submission = await db.submission.create({
        data: { workId, userEmail },
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

  static async findAllByWorkId(workId: string) {
    return await db.submission.findMany({
      where: { workId },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });
  }

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
}
