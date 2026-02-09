import { db, Prisma, Work } from "@/lib/prisma";

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

export interface UpdateWorkPayload extends CreateWorkPayload {
  workId: string;
  tasks: Array<{
    id?: string; // Optional: If present, update. If missing, create.
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

  static async updateWorkTransaction(data: UpdateWorkPayload) {
    return await db.$transaction(async (tx) => {
      // 1. Update Parent Work Fields
      const updatedWork = await tx.work.update({
        where: { id: data.workId },
        data: {
          title: data.title,
          description: data.description,
          totalPoints: data.totalPoints,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      // 2. Handle Tasks Reconciliation

      // A. Identify Task IDs coming from the form
      const incomingTaskIds = data.tasks
        .map((t) => t.id)
        .filter((id): id is string => !!id);

      // B. Delete Tasks not in the form (Cascading delete handles children)
      await tx.task.deleteMany({
        where: {
          workId: data.workId,
          id: { notIn: incomingTaskIds },
        },
      });

      // C. Upsert Tasks (Update existing, Create new)
      for (const taskData of data.tasks) {
        let taskId = taskData.id;

        if (taskId) {
          // --- UPDATE EXISTING TASK ---
          await tx.task.update({
            where: { id: taskId },
            data: {
              title: taskData.title,
              description: taskData.description,
              point: taskData.point,
              url: taskData.pdfUrl,
            },
          });

          // Update Editor (Starter Code)
          await tx.editor.updateMany({
            where: { taskId: taskId },
            data: { solution: taskData.starterCode },
          });

          // Re-create Test Cases (Easier than diffing)
          await tx.testCase.deleteMany({ where: { taskId } });
          if (taskData.testCases.length > 0) {
            await tx.testCase.createMany({
              data: taskData.testCases.map((tc) => ({
                taskId: taskId!,
                input: tc.input,
                expectOutput: tc.expectOutput,
              })),
            });
          }

          // Re-create Hints
          await tx.hint.deleteMany({ where: { taskId } });
          if (taskData.hints.length > 0) {
            await tx.hint.createMany({
              data: taskData.hints.map((h) => ({
                taskId: taskId!,
                hint: h,
              })),
            });
          }
        } else {
          // --- CREATE NEW TASK ---
          const newTask = await tx.task.create({
            data: {
              workId: data.workId,
              title: taskData.title,
              description: taskData.description,
              point: taskData.point,
              url: taskData.pdfUrl,
            },
          });

          taskId = newTask.id;

          // Create Editor
          await tx.editor.create({
            data: {
              taskId: newTask.id,
              solution: taskData.starterCode,
              url: "",
            },
          });

          // Create Children
          if (taskData.testCases.length > 0) {
            await tx.testCase.createMany({
              data: taskData.testCases.map((tc) => ({
                taskId: newTask.id,
                input: tc.input,
                expectOutput: tc.expectOutput,
              })),
            });
          }
          if (taskData.hints.length > 0) {
            await tx.hint.createMany({
              data: taskData.hints.map((h) => ({
                taskId: newTask.id,
                hint: h,
              })),
            });
          }

          // Auto-create Submissions for new task
          const enrollments = await tx.enrollment.findMany({
            where: { labId: data.labId },
            select: { userEmail: true },
          });

          if (enrollments.length > 0) {
            await tx.submission.createMany({
              data: enrollments.map((e) => ({
                workId: data.workId,
                taskId: newTask.id,
                userEmail: e.userEmail,
                code: taskData.starterCode,
                status: "DRAFT",
                language: "python",
              })),
            });
          }
        }
      }

      return updatedWork;
    });
  }
}
