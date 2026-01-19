import { StreamRepository } from "@/repositories/StreamRepository";
import { LabRepository } from "@/repositories/LabRepository";

export class StreamController {
  static async createAnnouncement(
    labId: string,
    userEmail: string,
    content: string,
  ) {
    if (!content.trim()) throw new Error("Content cannot be empty");

    // 1. Authorization Logic
    // Check if user is Enrolled OR is Instructor
    const [isEnrolled, instructor] = await Promise.all([
      StreamRepository.isUserEnrolled(labId, userEmail),
      LabRepository.findInstructor(labId, userEmail),
    ]);

    if (!isEnrolled && !instructor) {
      throw new Error("You are not a member of this class");
    }

    // 2. Persist
    return await StreamRepository.createAnnouncement(labId, userEmail, content);
  }
}
