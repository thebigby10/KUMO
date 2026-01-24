import { db } from "@/models/models";

export class AnnouncementRepository {
  // --- CREATE ---
  static async create(labId: string, userEmail: string, content: string) {
    return await db.announcement.create({
      data: {
        labId,
        content,
        postedBy: userEmail,
      },
    });
  }

  // --- READ ---
  static async findById(id: string) {
    return await db.announcement.findUnique({
      where: { id },
    });
  }

  static async findAllByLabId(labId: string) {
    return await db.announcement.findMany({
      where: { labId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // --- UPDATE ---
  static async update(id: string, content: string) {
    return await db.announcement.update({
      where: { id },
      data: { content },
    });
  }

  // --- DELETE ---
  static async delete(id: string) {
    return await db.announcement.delete({
      where: { id },
    });
  }

  static async deleteByLabId(labId: string) {
    return await db.announcement.deleteMany({
      where: { labId },
    });
  }
}
