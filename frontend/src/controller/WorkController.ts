import { LabWorkRepository } from "@/repositories/LabWorkRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { db } from "@/models/models";

export interface CreateWorkDTO {
  labId: string;
  userEmail: string;
  title: string;
  description?: string;
  totalPoints: number;
  endTime?: Date | null;
  tasks: {
    title: string;
    description: string;
    starterCode: string;
    language: string;
  }[];
}

export class WorkController {
  // --- CREATE ---
  static async createAssignment(payload: CreateWorkDTO) {
    const {
      labId,
      userEmail,
      title,
      description,
      totalPoints,
      endTime,
      tasks,
    } = payload;

    // Check Permissions via InstructorRepository
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );
    if (!instructor)
      throw new Error("Unauthorized: Only instructors can create assignments");

    if (tasks.length === 0) throw new Error("At least one task is required");

    // Complex Transaction: We still use db.$transaction here because it involves
    // multiple entities (Work, Task, Editor) that must succeed or fail together.
    // While we have separated repositories, for *Transaction* orchestration,
    // it's often cleaner to do it here or keep a specialized method.
    // However, adhering to "Repository Separation", we can construct the Prisma input
    // and pass it to LabWorkRepository if we allow nested creates there,
    // or manually chain them in a transaction block here.

    return await db.$transaction(async (tx) => {
      // Create Parent (Work)
      const newWork = await tx.labWork.create({
        data: {
          labId,
          title,
          description,
          totalPoints,
          endTime,
        },
      });

      // Create Children (Tasks & Editors)
      for (const task of tasks) {
        const newTask = await tx.labTask.create({
          data: {
            labWorkId: newWork.id,
            title: task.title,
            description: task.description,
            point: Math.floor(totalPoints / tasks.length),
            url: task.language,
          },
        });

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

  // --- READ ---
  static async getWorkById(workId: string) {
    return await LabWorkRepository.findById(workId);
  }

  // --- DELETE ---
  static async deleteWork(workId: string, userEmail: string) {
    const work = await LabWorkRepository.findById(workId);
    if (!work) throw new Error("Assignment not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    // Cascading delete needs to happen via DB or transactional script.
    // Since we separated repositories, we run the transaction here.
    return await db.$transaction(async (tx) => {
      // 1. Find Tasks
      const tasks = await tx.labTask.findMany({
        where: { labWorkId: workId },
        select: { id: true },
      });
      const taskIds = tasks.map((t) => t.id);

      if (taskIds.length > 0) {
        // Delete related entities using standard Prisma calls inside this transaction
        await tx.editor.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.testCase.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.hint.deleteMany({ where: { taskId: { in: taskIds } } });
        await tx.taskMaterial.deleteMany({
          where: { taskId: { in: taskIds } },
        });
        await tx.labTask.deleteMany({ where: { labWorkId: workId } });
      }

      await tx.labMaterial.deleteMany({ where: { labWorkId: workId } });
      return await tx.labWork.delete({ where: { id: workId } });
    });
  }
}
