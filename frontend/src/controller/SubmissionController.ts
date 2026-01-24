import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { LabWorkRepository } from "@/repositories/LabWorkRepository";
import { LabTaskRepository } from "@/repositories/LabTaskRepository";
import { db } from "@/models/models";

// Helper for Piston Execution
const PISTON_URL =
  process.env.PISTON_URL || "http://localhost:2000/api/v2/execute";

export class SubmissionController {
  // [Missing] initializeSubmission / getStudentSubmission
  static async getStudentSubmission(workId: string, userEmail: string) {
    // Finds existing or creates a DRAFT
    const submission = await SubmissionRepository.findOrCreate(
      workId,
      userEmail,
    );
    const details = await SubmissionRepository.findById(submission.id);
    return details;
  }

  // [Missing] saveDraft
  static async saveCode(
    submissionId: string,
    taskId: string,
    code: string,
    language: string,
  ) {
    // Check if submission is already submitted?
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

  // [Missing] submitAssignment
  static async submitAssignment(submissionId: string) {
    return await SubmissionRepository.updateStatus(
      submissionId,
      "SUBMITTED",
      new Date(),
    );
  }

  // [Missing] unsubmitAssignment (Reset status to draft)
  static async unsubmitAssignment(submissionId: string) {
    return await SubmissionRepository.updateStatus(
      submissionId,
      "DRAFT",
      undefined,
    );
  }

  // [Missing] runTestCases
  // This is the core logic for the "Run Tests" button
  static async runTestCases(submissionId: string, taskId: string) {
    // 1. Fetch Code
    const record = await SubmissionRepository.getRecord(submissionId, taskId);
    if (!record || !record.code) throw new Error("No code found to run");

    // 2. Fetch Test Cases for the Task
    const task = await db.labTask.findUnique({
      where: { id: taskId },
      include: { testCases: true },
    });
    if (!task) throw new Error("Task not found");

    if (task.testCases.length === 0) {
      return { message: "No test cases defined for this task." };
    }

    const results = [];

    // 3. Execute against Piston for each Test Case
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
