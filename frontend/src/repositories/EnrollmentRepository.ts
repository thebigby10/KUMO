import { db } from "@/lib/prisma";

export class EnrollmentRepository {
  // --- CREATE ---
  static async create(userEmail: string, labId: string) {
    return await db.enrollment.create({
      data: { userEmail, labId },
    });
  }

  // --- READ ---
  static async findByUserAndLab(userEmail: string, labId: string) {
    return await db.enrollment.findUnique({
      where: {
        userEmail_labId: { userEmail, labId },
      },
    });
  }

  static async findAllByLabId(labId: string) {
    return await db.enrollment.findMany({
      where: { labId },
      include: { user: true }, // Include user details for "People" tab
      orderBy: { user: { name: "asc" } },
    });
  }

  // --- DELETE ---
  static async delete(userEmail: string, labId: string) {
    return await db.enrollment.delete({
      where: {
        userEmail_labId: { userEmail, labId },
      },
    });
  }

  static async deleteByLabId(labId: string) {
    return await db.enrollment.deleteMany({
      where: { labId },
    });
  }
}
