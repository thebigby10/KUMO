import { AnnouncementRepository } from "@/repositories/AnnouncementRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";

export class StreamController {
  static async createAnnouncement(
    labId: string,
    userEmail: string,
    content: string,
  ) {
    if (!content.trim()) throw new Error("Content cannot be empty");

    // 1. Authorization Logic: Use separate repositories
    const [enrollment, instructor] = await Promise.all([
      EnrollmentRepository.findByUserAndLab(userEmail, labId),
      InstructorRepository.findByUserAndLab(userEmail, labId),
    ]);

    if (!enrollment && !instructor) {
      throw new Error("You are not a member of this class");
    }

    // 2. Persist using Announcement Repository
    return await AnnouncementRepository.create(labId, userEmail, content);
  }

  static async deleteAnnouncement(announcementId: string, userEmail: string) {
    const announcement = await AnnouncementRepository.findById(announcementId);
    if (!announcement) throw new Error("Announcement not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      announcement.labId,
    );

    // Only author or instructor can delete
    if (announcement.postedBy !== userEmail && !instructor) {
      throw new Error("Unauthorized to delete this post");
    }

    return await AnnouncementRepository.delete(announcementId);
  }
}
