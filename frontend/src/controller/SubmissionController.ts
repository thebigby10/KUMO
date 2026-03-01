import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { TaskRepository } from "@/repositories/TaskRepository";

const CODE_EXEC_URL =
  process.env.CODE_EXEC_URL || "http://localhost:8001/execute";

export class SubmissionController {
  static async getStudentSubmission(workId: string, userEmail: string) {
    return await SubmissionRepository.findAllForWork(workId, userEmail);
  }

  static async saveCode(
    submissionId: string,
    taskId: string,
    code: string,
    language: string,
  ) {
    const submission = await SubmissionRepository.findById(submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status === "SUBMITTED") {
      throw new Error("Cannot edit submitted work. Unsubmit first.");
    }

    return await SubmissionRepository.updateCode(
      taskId,
      submission.userEmail,
      code,
    );
  }

  static async runTestCases(
    taskId: string,
    code: string,
    language: string = "python",
  ) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");

    if (task.testCases.length === 0) {
      return [];
    }

    const results = [];

    for (const test of task.testCases) {
      try {
        const response = await fetch(CODE_EXEC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            version: "*",
            source_code: code,
            stdin: test.input,
          }),
        });

        const data = await response.json();
        const actualOutput = (data.run?.stdout || data.stdout || data.output || "").trim();
        const expectedOutput = test.expectOutput.trim();
        const passed = actualOutput === expectedOutput;

        results.push({
          testCaseId: test.id,
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
          error: data.run?.stderr || data.stderr || null,
        });
      } catch (e) {
        results.push({
          testCaseId: test.id,
          input: test.input,
          expected: test.expectOutput.trim(),
          actual: "",
          passed: false,
          error: "Execution service unavailable",
        });
      }
    }

    return results;
  }
}
