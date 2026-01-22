import { db } from "@/models/models";
import { Prisma } from "@prisma/client";

export class LabRepository {
  // --- CREATE ---
  static async create(data: Prisma.LabCreateInput) {
    // Prisma allows nested writes (creating instructor with lab).
    // This is still a Lab creation operation.
    return await db.lab.create({ data });
  }

  // --- READ ---
  static async findById(id: string) {
    return await db.lab.findUnique({
      where: { id },
    });
  }

  static async findByCode(labCode: string) {
    return await db.lab.findUnique({
      where: { labCode },
    });
  }

  // Finds labs where the user is either an instructor or enrolled
  static async findAllRelatedToUser(email: string) {
    return await db.lab.findMany({
      where: {
        OR: [
          { instructors: { some: { userEmail: email } } },
          { enrollments: { some: { userEmail: email } } },
        ],
      },
      include: {
        // We often need the owner name for the dashboard card
        instructors: {
          where: { role: "OWNER" },
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // --- UPDATE ---
  static async update(id: string, data: Prisma.LabUpdateInput) {
    return await db.lab.update({
      where: { id },
      data,
    });
  }

  // --- DELETE ---
  static async delete(id: string) {
    return await db.lab.delete({
      where: { id },
    });
  }
}
