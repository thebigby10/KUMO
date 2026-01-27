import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { TaskRepository } from "@/repositories/TaskRepository";

// Helper for Piston Execution
const PISTON_URL =
  process.env.PISTON_URL || "http://localhost:2000/api/v2/execute";

export class SubmissionController {
  static async getStudentSubmission(workId: string, userEmail: string) {
    const submission = await SubmissionRepository.findOrCreate(
      workId,
      userEmail,
    );
    return await SubmissionRepository.findById(submission.id);
  }

  static async saveCode(
    submissionId: string,
    taskId: string,
    code: string,
    language: string,
  ) {
    const submission = await SubmissionRepository.findById(submissionId);
    if (submission?.status === "SUBMITTED") {
      throw new Error("Cannot edit submitted work. Unsubmit first.");
    }

    return await SubmissionRepository.upsertRecord(
      submissionId,
      taskId,
      code,
      language,
    );
  }

  // ... submitAssignment and unsubmitAssignment remain same ...

  static async runTestCases(submissionId: string, taskId: string) {
    const record = await SubmissionRepository.getRecord(submissionId, taskId);
    if (!record || !record.code) throw new Error("No code found to run");

    // Updated to use TaskRepository
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");

    if (task.testCases.length === 0) {
      return { message: "No test cases defined for this task." };
    }

    const results = [];

    for (const test of task.testCases) {
      try {
        const response = await fetch(PISTON_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: record.language,
            version: "*",
            files: [{ content: record.code }],
            stdin: test.input,
          }),
        });

        const data = await response.json();
        const actualOutput = (data.run.stdout || "").trim();
        const expectedOutput = test.expectOutput.trim();
        const passed = actualOutput === expectedOutput;

        results.push({
          testCaseId: test.id,
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: passed,
          error: data.run.stderr || null,
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
