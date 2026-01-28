import { autoSaveCode } from "@/actions/submission";
import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/prisma";

// Mock dependencies
jest.mock("@/actions/auth");
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    submission: {
      update: jest.fn(),
    },
  },
}));

describe("Submission Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("autoSaveCode", () => {
    it("should return error if user not logged in", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const result = await autoSaveCode("task-1", "print()");
      expect(result.error).toBe("Unauthorized");
    });

    it("should update submission in DB if authorized", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "student@test.com",
      });
      (prisma.submission.update as jest.Mock).mockResolvedValue({
        id: "sub-1",
      });

      const result = await autoSaveCode("task-1", "print('updated')");

      expect(prisma.submission.update).toHaveBeenCalledWith({
        where: {
          taskId_userEmail: { taskId: "task-1", userEmail: "student@test.com" },
        },
        data: {
          code: "print('updated')",
          lastSavedAt: expect.any(Date),
        },
      });
      expect(result.success).toBe(true);
      expect(result.savedAt).toBeDefined();
    });

    it("should return error if DB update fails", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "student@test.com",
      });
      (prisma.submission.update as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      const result = await autoSaveCode("task-1", "code");
      expect(result.error).toBe("Save failed");
    });
  });
});
