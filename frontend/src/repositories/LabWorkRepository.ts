import { db } from "@/models/models";
import { Prisma } from "@prisma/client";

export class LabWorkRepository {
  // --- CREATE ---
  static async create(data: Prisma.LabWorkCreateInput) {
    return await db.labWork.create({
      data,
    });
  }

  // --- READ ---
  static async findById(id: string) {
    return await db.labWork.findUnique({
      where: { id },
      include: {
        // Often needed to display the work details
        tasks: {
          include: { editors: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async findAllByLabId(labId: string) {
    return await db.labWork.findMany({
      where: { labId },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: true, // Needed for task count
      },
    });
  }

  // --- UPDATE ---
  static async update(id: string, data: Prisma.LabWorkUpdateInput) {
    return await db.labWork.update({
      where: { id },
      data,
    });
  }

  // --- DELETE ---
  static async delete(id: string) {
    return await db.labWork.delete({
      where: { id },
    });
  }
}
