"use server";

import { getCurrentUser } from "@/actions/auth";
import { SubmissionController } from "@/controller/SubmissionController";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";

export async function submitTaskAction(
  workId: string,
  taskId: string,
  code: string,
  language: string,
) {
  const user = await getCurrentUser();

  if (!user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Find the specific submission record for this user and task
    const submission = await SubmissionRepository.findByTask(
      taskId,
      user.email,
    );

    if (!submission) {
      return { error: "Submission record not found." };
    }

    // 2. Save the code (using the controller or repo directly)
    // Note: using SubmissionController.saveCode logic but adapting to find ID first
    await SubmissionController.saveCode(submission.id, taskId, code, language);

    // 3. Run Test Cases
    const testResults = await SubmissionController.runTestCases(
      submission.id,
      taskId,
    );

    // 4. (Optional) Auto-submit if all tests pass, or just return results
    // For this implementation, we return results so the student sees them.

    return { success: true, testResults };
  } catch (error) {
    console.error("Submission error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to submit code.",
    };
  }
}
