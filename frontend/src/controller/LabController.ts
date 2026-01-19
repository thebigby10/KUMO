import { LabRepository } from "@/repositories/LabRepository";
import { generateLabCode } from "@/lib/utils";

export class LabController {
  static async create(
    data: { name: string; section?: string; subject?: string; room?: string },
    userEmail: string,
  ) {
    if (!data.name || !userEmail) {
      throw new Error("Class name and User are required");
    }

    // Prepare data for Repository
    const labData = {
      name: data.name,
      section: data.section,
      subject: data.subject,
      room: data.room,
      labCode: generateLabCode(),
      instructors: {
        create: {
          userEmail: userEmail,
          role: "OWNER" as const, // Type assertion for Prisma Enum
        },
      },
    };

    return await LabRepository.create(labData);
  }

  static async join(labCode: string, userEmail: string) {
    if (!labCode || !userEmail) throw new Error("Class code is required");

    // 1. Fetch Data
    const lab = await LabRepository.findByCode(labCode);

    if (!lab) throw new Error("Class not found");

    // 2. Execute Business Logic (Permissions/Validation)
    const isInstructor = lab.instructors.some(
      (inst) => inst.userEmail === userEmail,
    );
    if (isInstructor) throw new Error("You are already teaching this class");

    const isEnrolled = lab.enrollments.some(
      (enroll) => enroll.userEmail === userEmail,
    );
    if (isEnrolled) throw new Error("You are already enrolled");

    // 3. Persist
    return await LabRepository.addEnrollment(userEmail, lab.id);
  }

  static async getAllForUser(email: string) {
    return await LabRepository.findAllRelatedToUser(email);
  }

  static async getById(labId: string) {
    return await LabRepository.findById(labId);
  }
}
