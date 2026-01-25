import { db } from "@/models/models";
import { Prisma, Work } from "@prisma/client";

// DTO for complex creation
export interface CreateWorkPayload {
  labId: string;
  title: string;
  description?: string;
  totalPoints: number;
  endTime?: Date | null;
  tasks: Array<{
    title: string;
    description: string;
    point: number;
    url?: string; // Language stored here
    starterCode: string;
  }>;
}

export class WorkRepository {
  /**
   * CREATE: Transactional creation of Work + Tasks + Editor Config
   */
  static async createWithTasks(data: CreateWorkPayload): Promise<Work> {
    return await db.$transaction(async (tx) => {
      // 1. Create Parent Work
      const newWork = await tx.work.create({
        data: {
          labId: data.labId,
          title: data.title,
          description: data.description,
          totalPoints: data.totalPoints,
          endTime: data.endTime,
        },
      });

      // 2. Create Children (Tasks)
      for (const task of data.tasks) {
        const newTask = await tx.task.create({
          data: {
            workId: newWork.id,
            title: task.title,
            description: task.description,
            point: task.point,
            url: task.url,
          },
        });

        // 3. Create Editor (Starter Code)
        await tx.editor.create({
          data: {
            taskId: newTask.id,
            solution: task.starterCode,
            url: "",
          },
        });
      }

      return newWork;
    });
  }

  static async findById(id: string) {
    return await db.work.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { editors: true, testCases: true },
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
        tasks: { select: { id: true } }, // Lightweight count
        _count: { select: { submissions: true } },
      },
    });
  }

  static async update(id: string, data: Prisma.WorkUpdateInput) {
    return await db.work.update({
      where: { id },
      data,
    });
  }

  /**
   * DELETE: Cascading delete via transaction
   */
  static async delete(id: string) {
    return await db.$transaction(async (tx) => {
      // 1. Identify Tasks
      const tasks = await tx.task.findMany({
        where: { workId: id },
        select: { id: true },
      });
      const taskIds = tasks.map((t) => t.id);

      if (taskIds.length > 0) {
        // Delete Task Dependencies
        await tx.editor.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.testCase.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.hint.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.taskMaterial.deleteMany({
          where: { taskId: { in: taskIds } },
        });

        // Delete Submission Records (Linked to Tasks)
        await tx.submissionRecord.deleteMany({
          where: { taskId: { in: taskIds } },
        });

        // Delete Tasks
        await tx.task.deleteMany({ where: { workId: id } });
      }

      // 2. Delete Work Dependencies
      await tx.labMaterial.deleteMany({ where: { workId: id } });

      // Delete Submissions (SubmissionRecords were deleted above via Task link, or via Cascade here)
      await tx.submission.deleteMany({ where: { workId: id } });

      // 3. Delete Work
      return await tx.work.delete({ where: { id } });
    });
  }
}
