import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { WorkRepository } from "@/repositories/WorkRepository"; // Correct Import

export class GradingController {
  static async getSubmissionsForWork(workId: string, userEmail: string) {
    const work = await WorkRepository.findById(workId); // Use WorkRepository
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

  static async gradeSubmission(
    submissionId: string,
    userEmail: string,
    grade: number,
    feedback: string,
  ) {
    const submission = await SubmissionRepository.findById(submissionId);
    if (!submission) throw new Error("Submission not found");

    const work = await WorkRepository.findById(submission.workId); // Use WorkRepository
    if (!work) throw new Error("Work not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    if (grade < 0 || grade > work.totalPoints) {
      // Optional: Add strict validation here if tasks don't have individual points summed up
    }

    return await SubmissionRepository.gradeById(submissionId, grade, feedback);
  }
}
