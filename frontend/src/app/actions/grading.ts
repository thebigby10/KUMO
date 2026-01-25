"use server";

import { getCurrentUser } from "@/app/actions/auth";
import { GradingController } from "@/controller/GradingController";
import { SubmissionController } from "@/controller/SubmissionController";

/**
 * Server action to submit a grade for a student's submission.
 * 
 * @param submissionId - The ID of the submission to grade
 * @param grade - The numeric grade (0 to totalPoints)
 * @param feedback - Optional feedback text for the student
 */
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { error: "Unauthorized" };
    }

    await GradingController.gradeSubmission(
      submissionId,
      user.email,
      grade,
      feedback,
    );

    return { success: true };
  } catch (error) {
    console.error("Error grading submission:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to submit grade",
    };
  }
}

/**
 * Server action to run test cases for a specific task in a submission.
 * Uses the Piston code execution engine.
 * 
 * @param submissionId - The submission containing the code
 * @param taskId - The task with test cases to run against
 */
export async function runTestsForTask(
  submissionId: string,
  taskId: string,
): Promise<{
  results?: Array<{
    testCaseId: string;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string | null;
  }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { error: "Unauthorized" };
    }

    // Use the existing SubmissionController method that runs tests via Piston
    const rawResults = await SubmissionController.runTestCases(submissionId, taskId);
    
    // Handle the case where there are no test cases
    if ("message" in rawResults) {
      return { error: rawResults.message };
    }

    // Normalize results to ensure consistent shape
    const results = rawResults.map((r) => ({
      testCaseId: r.testCaseId,
      input: r.input ?? "",
      expected: r.expected ?? "",
      actual: r.actual ?? "",
      passed: r.passed,
      error: r.error ?? null,
    }));

    return { results };
  } catch (error) {
    console.error("Error running tests:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to run tests",
    };
  }
}

/**
 * Server action to get submission dashboard data.
 * This is used when we need to refetch data after grading.
 * 
 * @param workId - The work/assignment ID
 */
export async function getSubmissionDashboard(workId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { error: "Unauthorized" };
    }

    const data = await GradingController.getSubmissionDashboard(workId, user.email);
    return { data };
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
