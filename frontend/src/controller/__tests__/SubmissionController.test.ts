import { SubmissionController } from "@/controller/SubmissionController";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
// We mock the db model directly because runTestCases uses db.labTask.findUnique
import { db } from "@/models/models";

// Mock Repositories and DB
jest.mock("@/repositories/SubmissionRepository");
jest.mock("@/models/models", () => ({
  db: {
    labTask: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock global fetch for Piston API calls
global.fetch = jest.fn();

describe("SubmissionController", () => {
  const mockUserEmail = "student@test.com";
  const mockWorkId = "work-1";
  const mockSubmissionId = "sub-1";
  const mockTaskId = "task-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStudentSubmission", () => {
    it("should find or create submission and return details", async () => {
      (SubmissionRepository.findOrCreate as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
      });
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        records: [],
      });

      const result = await SubmissionController.getStudentSubmission(
        mockWorkId,
        mockUserEmail,
      );

      expect(SubmissionRepository.findOrCreate).toHaveBeenCalledWith(
        mockWorkId,
        mockUserEmail,
      );
      expect(SubmissionRepository.findById).toHaveBeenCalledWith(
        mockSubmissionId,
      );
      expect(result).toEqual({ id: mockSubmissionId, records: [] });
    });
  });

  describe("saveCode", () => {
    it("should throw error if submission is already SUBMITTED", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        status: "SUBMITTED",
      });

      await expect(
        SubmissionController.saveCode(
          mockSubmissionId,
          mockTaskId,
          "print()",
          "python",
        ),
      ).rejects.toThrow("Cannot edit submitted work");
    });

    it("should upsert record if status is DRAFT", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        status: "DRAFT",
      });

      await SubmissionController.saveCode(
        mockSubmissionId,
        mockTaskId,
        "print()",
        "python",
      );

      expect(SubmissionRepository.upsertRecord).toHaveBeenCalledWith(
        mockSubmissionId,
        mockTaskId,
        "print()",
        "python",
      );
    });
  });

  describe("runTestCases", () => {
    const mockCodeRecord = {
      code: "print('hello')",
      language: "python",
    };

    const mockTask = {
      id: mockTaskId,
      testCases: [{ id: "tc-1", input: "test", expectOutput: "hello" }],
    };

    beforeEach(() => {
      (SubmissionRepository.getRecord as jest.Mock).mockResolvedValue(
        mockCodeRecord,
      );
      (db.labTask.findUnique as jest.Mock).mockResolvedValue(mockTask);
    });

    it("should throw if no code found", async () => {
      (SubmissionRepository.getRecord as jest.Mock).mockResolvedValue(null);
      await expect(
        SubmissionController.runTestCases(mockSubmissionId, mockTaskId),
      ).rejects.toThrow("No code found to run");
    });

    it("should execute tests and return results", async () => {
      // Mock Piston Response (Success)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          run: { stdout: "hello", stderr: "" },
        }),
      });

      const results = await SubmissionController.runTestCases(
        mockSubmissionId,
        mockTaskId,
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        testCaseId: "tc-1",
        input: "test",
        expected: "hello",
        actual: "hello",
        passed: true,
        error: null, // Fixed: Expecting null as per logic (data.run.stderr || null)
      });
    });

    it("should handle failed tests", async () => {
      // Mock Piston Response (Failure output)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          run: { stdout: "wrong output", stderr: "" },
        }),
      });

      const results = await SubmissionController.runTestCases(
        mockSubmissionId,
        mockTaskId,
      );

      expect(results[0].passed).toBe(false);
      expect(results[0].actual).toBe("wrong output");
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const results = await SubmissionController.runTestCases(
        mockSubmissionId,
        mockTaskId,
      );

      expect(results[0].passed).toBe(false);
      expect(results[0].error).toBe("Execution API Error");
    });
  });
});
