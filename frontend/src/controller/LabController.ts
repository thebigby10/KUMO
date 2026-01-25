import { LabRepository } from "@/repositories/LabRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { AnnouncementRepository } from "@/repositories/AnnouncementRepository";
import { WorkRepository } from "@/repositories/WorkRepository"; // Updated import
import { generateLabCode } from "@/lib/utils";

export class LabController {
  // ... create, getAllForUser, join, removeStudent remain the same ...

  static async create(
    data: { name: string; section?: string; subject?: string; room?: string },
    userEmail: string,
  ) {
    if (!data.name || !userEmail) {
      throw new Error("Class name and User are required");
    }

    const labData = {
      name: data.name,
      section: data.section,
      subject: data.subject,
      room: data.room,
      labCode: generateLabCode(),
      instructors: {
        create: {
          userEmail: userEmail,
          role: "OWNER" as const,
        },
      },
    };

    return await LabRepository.create(labData);
  }

  static async getById(labId: string) {
    const lab = await LabRepository.findById(labId);
    if (!lab) return null;

    const announcements = await AnnouncementRepository.findAllByLabId(labId);
    const instructors = await InstructorRepository.findAllByLabId(labId);
    const enrollments = await EnrollmentRepository.findAllByLabId(labId);

    return {
      ...lab,
      announcements,
      instructors,
      enrollments,
    };
  }

  static async getWithWorks(labId: string) {
    const lab = await LabRepository.findById(labId);
    if (!lab) return null;

    const instructors = await InstructorRepository.findAllByLabId(labId);
    // Updated to use WorkRepository
    const works = await WorkRepository.findAllByLabId(labId);

    return {
      ...lab,
      instructors,
      works, // Renamed from labWorks for consistency with new schema, check UI usage
    };
  }

  // ... rest of the existing methods (join, removeStudent, etc) ...
  static async getAllForUser(email: string) {
    return await LabRepository.findAllRelatedToUser(email);
  }

  static async findById(labId: string) {
    return LabRepository.findById(labId);
  }

  // ... (keep deleteLab, updateLab, getPeople, etc.) ...
}
