import { LabRepository } from "@/repositories/LabRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { AnnouncementRepository } from "@/repositories/AnnouncementRepository";
import { LabWorkRepository } from "@/repositories/LabWorkRepository";
import { generateLabCode } from "@/lib/utils";
import { db } from "@/models/models";

export class LabController {
  // --- CREATE ---
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
      // We create the relation here atomically using Prisma's nested write
      instructors: {
        create: {
          userEmail: userEmail,
          role: "OWNER" as const,
        },
      },
    };

    return await LabRepository.create(labData);
  }

  // --- READ ---
  static async getById(labId: string) {
    // We fetch the basic lab info
    const lab = await LabRepository.findById(labId);
    if (!lab) return null;

    // We fetch related data using specific repositories
    const announcements = await AnnouncementRepository.findAllByLabId(labId);
    const instructors = await InstructorRepository.findAllByLabId(labId);
    const enrollments = await EnrollmentRepository.findAllByLabId(labId);

    // Combine data for the view
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
    const labWorks = await LabWorkRepository.findAllByLabId(labId);

    return {
      ...lab,
      instructors,
      labWorks,
    };
  }

  static async getAllForUser(email: string) {
    return await LabRepository.findAllRelatedToUser(email);
  }

  static async getPeople(labId: string) {
    const instructors = await InstructorRepository.findAllByLabId(labId);
    const enrollments = await EnrollmentRepository.findAllByLabId(labId);

    if (!instructors && !enrollments) return null;

    return {
      instructors: instructors.map((inst) => inst.user),
      students: enrollments.map((enroll) => enroll.user),
    };
  }

  // --- UPDATE (JOIN) ---
  static async join(labCode: string, userEmail: string) {
    if (!labCode || !userEmail) throw new Error("Class code is required");

    const lab = await LabRepository.findByCode(labCode);
    if (!lab) throw new Error("Class not found");

    // Check Instructor Repository
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      lab.id,
    );
    if (instructor) throw new Error("You are already teaching this class");

    // Check Enrollment Repository
    const enrollment = await EnrollmentRepository.findByUserAndLab(
      userEmail,
      lab.id,
    );
    if (enrollment) throw new Error("You are already enrolled");

    // Perform Join via Enrollment Repository
    return await EnrollmentRepository.create(userEmail, lab.id);
  }

  // --- DELETE / REMOVE ---
  static async removeStudent(
    labId: string,
    userEmail: string,
    studentEmail: string,
  ) {
    // Auth Check: Is the requester an instructor?
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );

    // Or is the user removing themselves?
    if (!instructor && userEmail !== studentEmail) {
      throw new Error("Unauthorized");
    }

    return await EnrollmentRepository.delete(studentEmail, labId);
  }
  static async findById(labId: string) {
    return LabRepository.findById(labId);
  }
}
