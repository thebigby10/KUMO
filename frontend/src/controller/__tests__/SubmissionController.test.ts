import { SubmissionController } from "@/controller/SubmissionController";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { TaskRepository } from "@/repositories/TaskRepository";

// Explicit mocks for Repositories
jest.mock("@/repositories/SubmissionRepository", () => ({
  SubmissionRepository: {
    findById: jest.fn(),
    findAllForWork: jest.fn(),
    updateCode: jest.fn(),
  },
}));

jest.mock("@/repositories/TaskRepository", () => ({
  TaskRepository: {
    findById: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe("SubmissionController", () => {
  const mockSubmissionId = "sub-1";
  const mockTaskId = "task-1";
  const mockUserEmail = "student@test.com";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveCode", () => {
    it("should throw error if submission is already SUBMITTED", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        status: "SUBMITTED",
        userEmail: mockUserEmail,
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

    it("should update code if status is DRAFT", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        status: "DRAFT",
        userEmail: mockUserEmail,
      });

      await SubmissionController.saveCode(
        mockSubmissionId,
        mockTaskId,
        "print()",
        "python",
      );

      // Expect the repository method used in Controller (updateCode) to be called
      expect(SubmissionRepository.updateCode).toHaveBeenCalledWith(
        mockTaskId,
        mockUserEmail,
        "print()",
      );
    });
  });

  describe("runTestCases", () => {
    const mockSubmission = {
      id: mockSubmissionId,
      taskId: mockTaskId,
      code: "print('hello')",
      userEmail: mockUserEmail,
    };

    const mockTask = {
      id: mockTaskId,
      testCases: [{ id: "tc-1", input: "test", expectOutput: "hello" }],
    };

    beforeEach(() => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue(
        mockSubmission,
      );
      (TaskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
    });

    it("should execute tests and return results", async () => {
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
      expect(results[0].passed).toBe(true);
    });
  });
});
