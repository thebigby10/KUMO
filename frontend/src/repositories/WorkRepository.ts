import { db } from "@/models/models";

/**
 * @deprecated This repository is not currently used.
 * Use LabWorkRepository instead for all LabWork operations.
 * 
 * The transaction logic here duplicates what exists in WorkController.
 * Consider removing this file after confirming with the team.
 */
export interface LabWorkTransactionData {
  labId: string;
  title: string;
  description?: string;
  totalPoints: number;
  endTime?: Date | null;
  tasks: Array<{
    title: string;
    description: string;
    point: number;
    language: string;
    starterCode: string;
  }>;
}

export class WorkRepository {
  // Handles the complex transaction of creating Work + Tasks + Editors
  static async createWorkTransaction(data: LabWorkTransactionData) {
    return await db.$transaction(async (tx) => {
      // 1. Create Parent
      const newWork = await tx.labWork.create({
        data: {
          labId: data.labId,
          title: data.title,
          description: data.description,
          totalPoints: data.totalPoints,
          endTime: data.endTime,
        },
      });

      // 2. Create Children
      for (const task of data.tasks) {
        const newTask = await tx.labTask.create({
          data: {
            labWorkId: newWork.id,
            title: task.title,
            description: task.description,
            point: task.point,
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

  static async findById(id: string) {
    return await db.labWork.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { editors: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }
}
