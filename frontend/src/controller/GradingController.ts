import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { LabWorkRepository } from "@/repositories/LabWorkRepository";

/**
 * Controller for instructor grading operations.
 * 
 * Provides functionality for:
 * - Viewing all submissions for an assignment
 * - Grading individual submissions with points and feedback
 * 
 * All methods require instructor authorization.
 */
export class GradingController {
  // [Missing] getSubmissionsForWork
  static async getSubmissionsForWork(workId: string, userEmail: string) {
    const work = await LabWorkRepository.findById(workId);
    if (!work) throw new Error("Work not found");

    // Auth check
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    const submissions = await SubmissionRepository.findAllByWorkId(workId);
    return submissions;
  }

  // [Missing] gradeSubmission
  static async gradeSubmission(
    submissionId: string,
    userEmail: string,
    grade: number,
    feedback: string,
  ) {
    // We need to fetch the submission to verify lab ownership
    const submission = await SubmissionRepository.findById(submissionId);
    if (!submission) throw new Error("Submission not found");

    const work = await LabWorkRepository.findById(submission.labWorkId);
    if (!work) throw new Error("Work not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    if (grade < 0 || grade > work.totalPoints) {
      throw new Error(`Grade must be between 0 and ${work.totalPoints}`);
    }

    return await SubmissionRepository.grade(submissionId, grade, feedback);
  }
}
