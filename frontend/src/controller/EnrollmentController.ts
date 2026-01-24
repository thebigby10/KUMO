import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";

/**
 * Controller for managing lab enrollments.
 * Handles student enrollment, removal, and membership queries.
 * 
 * Note: Most enrollment operations are currently handled by LabController.
 * This controller can be extended for enrollment-specific business logic.
 */
export class EnrollmentController {
  /**
   * Check if a user is a member of a lab (either as student or instructor)
   */
  static async isMember(userEmail: string, labId: string): Promise<boolean> {
    const [enrollment, instructor] = await Promise.all([
      EnrollmentRepository.findByUserAndLab(userEmail, labId),
      InstructorRepository.findByUserAndLab(userEmail, labId),
    ]);
    return !!(enrollment || instructor);
  }

  /**
   * Check if a user is an instructor in a lab
   */
  static async isInstructor(userEmail: string, labId: string): Promise<boolean> {
    const instructor = await InstructorRepository.findByUserAndLab(userEmail, labId);
    return !!instructor;
  }
}
