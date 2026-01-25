import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { LabWorkRepository } from "@/repositories/LabWorkRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";

/**
 * Controller for instructor grading operations.
 * 
 * Provides functionality for:
 * - Viewing all submissions for an assignment
 * - Grading individual submissions with points and feedback
 * - Getting dashboard statistics for submissions
 * 
 * All methods require instructor authorization.
 */
export class GradingController {
  /**
   * Get the full submission dashboard data for a work assignment.
   * Returns stats, all submissions, enrolled count, and work details.
   */
  static async getSubmissionDashboard(workId: string, userEmail: string) {
    const work = await LabWorkRepository.findById(workId);
    if (!work) throw new Error("Work not found");

    // Auth check
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized: Only instructors can view this");

    // Get all data in parallel
    const [submissions, stats, enrollments] = await Promise.all([
      SubmissionRepository.findAllByWorkIdWithDetails(workId),
      SubmissionRepository.getStatsByWorkId(workId),
      EnrollmentRepository.findAllByLabId(work.labId),
    ]);

    // Students who haven't started (no submission record at all)
    const submittedEmails = new Set(submissions.map((s) => s.userEmail));
    const notStarted = enrollments.filter(
      (e) => !submittedEmails.has(e.userEmail)
    );

    return {
      work: {
        id: work.id,
        title: work.title,
        labId: work.labId,
        totalPoints: work.totalPoints,
        endTime: work.endTime,
        taskCount: work.tasks.length,
      },
      stats: {
        ...stats,
        notStarted: notStarted.length,
        enrolled: enrollments.length,
      },
      submissions,
      notStartedStudents: notStarted.map((e) => e.user),
    };
  }

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

  /**
   * Get a specific student's submission for grading view.
   * Includes full code, task details, and test cases.
   */
  static async getStudentSubmission(
    workId: string,
    studentEmail: string,
    instructorEmail: string,
  ) {
    // Use the full task details method to include testCases
    const work = await LabWorkRepository.findByIdWithFullTaskDetails(workId);
    if (!work) throw new Error("Work not found");

    // Auth check
    const instructor = await InstructorRepository.findByUserAndLab(
      instructorEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    const submission = await SubmissionRepository.findByWorkAndUser(
      workId,
      studentEmail,
    );

    return {
      work: {
        id: work.id,
        title: work.title,
        labId: work.labId,
        totalPoints: work.totalPoints,
        tasks: work.tasks,
      },
      submission,
    };
  }

  /**
   * Get submission by ID with full details for grading.
   */
  static async getSubmissionById(submissionId: string, instructorEmail: string) {
    const submission = await SubmissionRepository.findByIdWithFullDetails(submissionId);
    if (!submission) throw new Error("Submission not found");

    // Auth check
    const instructor = await InstructorRepository.findByUserAndLab(
      instructorEmail,
      submission.labWork.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    return submission;
  }
}
