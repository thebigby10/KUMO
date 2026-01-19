import { db } from "@/models";

export class StreamRepository {
  static async createAnnouncement(
    labId: string,
    userEmail: string,
    content: string,
  ) {
    return await db.announcement.create({
      data: {
        content,
        labId,
        postedBy: userEmail,
      },
    });
  }

  static async isUserEnrolled(
    labId: string,
    userEmail: string,
  ): Promise<boolean> {
    const enrollment = await db.enrollment.findUnique({
      where: { userEmail_labId: { userEmail, labId } },
    });
    return !!enrollment;
  }
}
