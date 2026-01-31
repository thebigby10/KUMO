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
    const works = await WorkRepository.findAllByLabId(labId);

    return {
      ...lab,
      announcements,
      instructors,
      enrollments,
      works,
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

  static async getPeople(labId: string) {
    const instructors = await InstructorRepository.findAllByLabId(labId);
    const enrollments = await EnrollmentRepository.findAllByLabId(labId);

    if (!instructors && !enrollments) return null;

    return {
      instructors: instructors.map((inst) => inst.user),
      students: enrollments.map((enroll) => enroll.user),
    };
  }
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
  static async updateLab(
    labId: string,
    userEmail: string,
    data: {
      name?: string;
      room?: string;
      section?: string;
      subject?: string;
      isArchived?: boolean;
    },
  ) {
    // 1. Authorization: Only OWNER/Instructor
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    return await LabRepository.update(labId, data);
  }

  // [Missing] deleteLab
  static async deleteLab(labId: string, userEmail: string) {
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );

    // Only the OWNER can hard delete
    if (!instructor || instructor.role !== "OWNER") {
      throw new Error("Only the class owner can delete this class");
    }

    return await LabRepository.delete(labId);
  }

  // [Missing] getMembers (People Tab)
  static async getMembers(labId: string) {
    const instructors = await InstructorRepository.findAllByLabId(labId);
    const enrollments = await EnrollmentRepository.findAllByLabId(labId);

    return {
      instructors: instructors.map((i) => ({ ...i.user, role: i.role })),
      students: enrollments.map((e) => e.user),
    };
  }

  // [Missing] addInstructor
  static async addInstructor(
    labId: string,
    ownerEmail: string,
    newInstructorEmail: string,
  ) {
    const owner = await InstructorRepository.findByUserAndLab(
      ownerEmail,
      labId,
    );
    if (owner?.role !== "OWNER")
      throw new Error("Only the owner can add teachers");

    // Prevent adding if already enrolled as student
    const isStudent = await EnrollmentRepository.findByUserAndLab(
      newInstructorEmail,
      labId,
    );
    if (isStudent)
      throw new Error("User is currently a student. Remove them first.");

    return await InstructorRepository.create(
      newInstructorEmail,
      labId,
      "ASSISTANT",
    );
  }
}
