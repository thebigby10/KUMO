import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { db } from "@/models/models";

// Mock DB
jest.mock("@/models/models", () => ({
  db: {
    submission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("SubmissionRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getWorkStats", () => {
    it("should calculate stats correctly", async () => {
      const mockSubmissions = [
        {
          status: "DRAFT",
          grade: null,
          userEmail: "u1@test.com",
          taskId: "t1",
        },
        {
          status: "SUBMITTED",
          grade: null,
          userEmail: "u2@test.com",
          taskId: "t1",
        },
        {
          status: "RETURNED",
          grade: 80,
          userEmail: "u3@test.com",
          taskId: "t1",
        },
        {
          status: "RETURNED",
          grade: 90,
          userEmail: "u3@test.com",
          taskId: "t2",
        },
      ];

      (db.submission.findMany as jest.Mock).mockResolvedValue(mockSubmissions);

      const stats = await SubmissionRepository.getWorkStats("work-1");

      // Verify logic
      expect(stats.totalSubmissions).toBe(4);
      expect(stats.totalStudents).toBe(3); // u1, u2, u3
      expect(stats.statusCounts.draft).toBe(1);
      expect(stats.statusCounts.submitted).toBe(1);
      expect(stats.statusCounts.returned).toBe(2);

      // Avg Grade: (80 + 90) / 2 = 85
      expect(stats.averageGrade).toBe(85);
    });

    it("should handle empty submissions", async () => {
      (db.submission.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await SubmissionRepository.getWorkStats("work-1");

      expect(stats.totalStudents).toBe(0);
      expect(stats.averageGrade).toBeNull();
    });
  });

  describe("updateCode", () => {
    it("should update code for specific task/user", async () => {
      await SubmissionRepository.updateCode(
        "task-1",
        "user@test.com",
        "new code",
      );

      expect(db.submission.update).toHaveBeenCalledWith({
        where: {
          taskId_userEmail: { taskId: "task-1", userEmail: "user@test.com" },
        },
        data: { code: "new code" },
      });
    });
  });
});
