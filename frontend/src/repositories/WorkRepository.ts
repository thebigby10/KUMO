import { db } from "@/models/models";
import { Prisma, Work } from "@prisma/client";

export interface CreateWorkPayload {
  labId: string;
  title: string;
  description?: string;
  totalPoints: number;
  startTime?: Date | null;
  endTime?: Date | null;
  tasks: Array<{
    title: string;
    description: string;
    pdfUrl?: string;
    starterCode: string;
    point: number;
    testCases: { input: string; expectOutput: string }[];
    hints: string[];
  }>;
}

export class WorkRepository {
  static async createWithTasks(data: CreateWorkPayload): Promise<Work> {
    return await db.$transaction(async (tx) => {
      // 1. Create Parent Work
      const newWork = await tx.work.create({
        data: {
          labId: data.labId,
          title: data.title,
          description: data.description,
          totalPoints: data.totalPoints,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      // 2. Create Tasks & store references for submission creation
      const createdTasks = [];

      for (const taskData of data.tasks) {
        // Create Task
        const newTask = await tx.task.create({
          data: {
            workId: newWork.id,
            title: taskData.title,
            description: taskData.description,
            point: taskData.point,
            url: taskData.pdfUrl,
          },
        });

        // Create Editor
        await tx.editor.create({
          data: {
            taskId: newTask.id,
            solution: taskData.starterCode,
            url: "",
          },
        });

        // Create Test Cases
        if (taskData.testCases.length > 0) {
          await tx.testCase.createMany({
            data: taskData.testCases.map((tc) => ({
              taskId: newTask.id,
              input: tc.input,
              expectOutput: tc.expectOutput,
            })),
          });
        }

        // Create Hints
        if (taskData.hints.length > 0) {
          await tx.hint.createMany({
            data: taskData.hints.map((h) => ({
              taskId: newTask.id,
              hint: h,
            })),
          });
        }

        createdTasks.push({
          id: newTask.id,
          starterCode: taskData.starterCode,
        });
      }

      // 3. Auto-create Submissions for all enrolled students for ALL tasks
      const enrollments = await tx.enrollment.findMany({
        where: { labId: data.labId },
        select: { userEmail: true },
      });

      if (enrollments.length > 0 && createdTasks.length > 0) {
        const submissionData = [];

        for (const enrollment of enrollments) {
          for (const task of createdTasks) {
            submissionData.push({
              workId: newWork.id,
              taskId: task.id,
              userEmail: enrollment.userEmail,
              code: task.starterCode,
              language: "python", // Default
              status: "DRAFT" as const,
            });
          }
        }

        await tx.submission.createMany({
          data: submissionData,
        });
      }

      return newWork;
    });
  }

  // Standard CRUD methods...
  static async findById(id: string) {
    return await db.work.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { editors: true, testCases: true, hints: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async findAllByLabId(labId: string) {
    return await db.work.findMany({
      where: { labId },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: { select: { id: true } },
        _count: { select: { submissions: true } },
      },
    });
  }

  static async update(id: string, data: Prisma.WorkUpdateInput) {
    return await db.work.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return await db.$transaction(async (tx) => {
      // Delete submissions linked to this work
      await tx.submission.deleteMany({ where: { workId: id } });
      // Delete tasks (cascade handles task children)
      await tx.task.deleteMany({ where: { workId: id } });
      // Delete materials
      await tx.labMaterial.deleteMany({ where: { workId: id } });
      // Delete work
      return await tx.work.delete({ where: { id } });
    });
  }
}
