import { db } from "@/lib/prisma";

export class InstructorRepository {
  // --- CREATE ---
  static async create(
    userEmail: string,
    labId: string,
    role: "OWNER" | "ASSISTANT" = "ASSISTANT",
  ) {
    return await db.instructor.create({
      data: { userEmail, labId, role },
    });
  }

  // --- READ ---
  static async findByUserAndLab(userEmail: string, labId: string) {
    return await db.instructor.findUnique({
      where: {
        labId_userEmail: { labId, userEmail },
      },
    });
  }

  static async findAllByLabId(labId: string) {
    return await db.instructor.findMany({
      where: { labId },
      include: { user: true },
    });
  }

  // --- DELETE ---
  static async delete(userEmail: string, labId: string) {
    return await db.instructor.delete({
      where: {
        labId_userEmail: { labId, userEmail },
      },
    });
  }

  static async deleteByLabId(labId: string) {
    return await db.instructor.deleteMany({
      where: { labId },
    });
  }
}
