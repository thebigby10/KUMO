import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { TaskRepository } from "@/repositories/TaskRepository";

// Helper for Piston Execution
const PISTON_URL =
  process.env.PISTON_URL || "http://localhost:2000/api/v2/execute";

export class SubmissionController {
  static async getStudentSubmission(workId: string, userEmail: string) {
    // Return all submissions for the work (the frontend usually handles finding the specific task submission from this list)
    return await SubmissionRepository.findAllForWork(workId, userEmail);
  }

  static async saveCode(
    submissionId: string,
    taskId: string,
    code: string,
    language: string,
  ) {
    // 1. Check if submission exists
    const submission = await SubmissionRepository.findById(submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status === "SUBMITTED") {
      throw new Error("Cannot edit submitted work. Unsubmit first.");
    }

    // 2. Update code via Repository
    // We use the ID since we have it, or we could use updateCode(taskId, userEmail, code)
    // Here we define a direct update by ID logic or use the existing repository method.
    // Since SubmissionRepository has updateCode(taskId, userEmail, code), we can use that if we have email,
    // or better, rely on the ID.
    return await SubmissionRepository.updateCode(
      taskId,
      submission.userEmail,
      code,
    );
  }

  static async runTestCases(submissionId: string, taskId: string) {
    // 1. Get the submission record to find the code
    const submission = await SubmissionRepository.findById(submissionId);
    if (!submission || !submission.code)
      throw new Error("No code found to run");

    // 2. Get Task details including Test Cases
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");

    if (task.testCases.length === 0) {
      return { message: "No test cases defined for this task." };
    }

    const results = [];
    // Defaulting to python if language isn't explicitly stored/passed,
    // or you can add a language field to your Submission model if needed.
    const language = "python";

    for (const test of task.testCases) {
      try {
        const response = await fetch(PISTON_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language, // Using the detected language
            version: "*",
            files: [{ content: submission.code }],
            stdin: test.input,
          }),
        });

        const data = await response.json();
        const actualOutput = (data.run?.stdout || "").trim();
        const expectedOutput = test.expectOutput.trim();
        const passed = actualOutput === expectedOutput;

        results.push({
          testCaseId: test.id,
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: passed,
          error: data.run?.stderr || null,
        });
      } catch (e) {
        results.push({
          testCaseId: test.id,
          passed: false,
          error: "Execution API Error",
        });
      }
    }

    return results;
  }
}
