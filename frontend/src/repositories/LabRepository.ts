import { db } from "@/models/models";
import { Prisma } from "../../generated/prisma/client/client";

export class LabRepository {
  // --- CREATE ---
  static async create(data: Prisma.LabCreateInput) {
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

  static async archive(id: string, isArchived: boolean) {
    return await db.lab.update({
      where: { id },
      data: { isArchived },
    });
  }

  // --- DELETE ---

  // Deletes lab and all related data (Prisma relations usually handle this if onDelete: Cascade is set in schema,
  // but explicit transaction is safer if schema isn't strict)
  static async delete(id: string) {
    return await db.$transaction([
      db.enrollment.deleteMany({ where: { labId: id } }),
      db.instructor.deleteMany({ where: { labId: id } }),
      db.announcement.deleteMany({ where: { labId: id } }),
      db.work.deleteMany({ where: { labId: id } }), // This will likely fail without cascading deletes on tasks
      db.lab.delete({ where: { id } }),
    ]);
  }
}
