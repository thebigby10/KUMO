import { db } from "@/models/models";
import { Prisma } from "@prisma/client";

export class LabRepository {
  static async create(data: Prisma.LabCreateInput) {
    return await db.lab.create({ data });
  }

  static async findByCode(labCode: string) {
    return await db.lab.findUnique({
      where: { labCode },
      include: {
        instructors: true,
        enrollments: true,
      },
    });
  }

  static async findById(id: string) {
    return await db.lab.findUnique({
      where: { id },
      include: {
        instructors: true,
        announcements: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });
  }

  static async findAllRelatedToUser(email: string) {
    return await db.lab.findMany({
      where: {
        OR: [
          { instructors: { some: { userEmail: email } } },
          { enrollments: { some: { userEmail: email } } },
        ],
      },
      include: {
        instructors: {
          where: { role: "OWNER" },
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async addEnrollment(userEmail: string, labId: string) {
    return await db.enrollment.create({
      data: { userEmail, labId },
    });
  }

  static async findInstructor(labId: string, userEmail: string) {
    return await db.instructor.findUnique({
      where: { labId_userEmail: { labId, userEmail } },
    });
  }
}
