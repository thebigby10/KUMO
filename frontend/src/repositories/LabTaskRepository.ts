import { db } from "@/models/models";
import { Prisma } from "@prisma/client";

export class LabTaskRepository {
  // --- CREATE ---
  static async create(data: Prisma.LabTaskCreateInput) {
    return await db.labTask.create({ data });
  }

  // --- READ ---
  static async findAllByWorkId(labWorkId: string) {
    return await db.labTask.findMany({
      where: { labWorkId },
    });
  }

  // --- DELETE ---
  static async deleteManyByWorkId(labWorkId: string) {
    return await db.labTask.deleteMany({
      where: { labWorkId },
    });
  }
}
