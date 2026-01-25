import { GradingController } from "@/controller/GradingController";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { LabWorkRepository } from "@/repositories/LabWorkRepository";

// Mock the repositories
jest.mock("@/repositories/SubmissionRepository");
jest.mock("@/repositories/InstructorRepository");
jest.mock("@/repositories/LabWorkRepository");

describe("GradingController", () => {
  const mockUserEmail = "instructor@test.com";
  const mockWorkId = "work-123";
  const mockSubmissionId = "sub-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSubmissionsForWork", () => {
    it("should throw error if work not found", async () => {
      (LabWorkRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        GradingController.getSubmissionsForWork(mockWorkId, mockUserEmail),
      ).rejects.toThrow("Work not found");
    });

    it("should throw error if user is not an instructor", async () => {
      (LabWorkRepository.findById as jest.Mock).mockResolvedValue({
        id: mockWorkId,
        labId: "lab-1",
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        GradingController.getSubmissionsForWork(mockWorkId, mockUserEmail),
      ).rejects.toThrow("Unauthorized");
    });

    it("should return submissions if authorized", async () => {
      (LabWorkRepository.findById as jest.Mock).mockResolvedValue({
        id: mockWorkId,
        labId: "lab-1",
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });
      const mockSubmissions = [{ id: "sub-1" }, { id: "sub-2" }];
      (SubmissionRepository.findAllByWorkId as jest.Mock).mockResolvedValue(
        mockSubmissions,
      );

      const result = await GradingController.getSubmissionsForWork(
        mockWorkId,
        mockUserEmail,
      );

      expect(result).toEqual(mockSubmissions);
      expect(SubmissionRepository.findAllByWorkId).toHaveBeenCalledWith(
        mockWorkId,
      );
    });
  });

  describe("gradeSubmission", () => {
    const mockWork = { id: mockWorkId, labId: "lab-1", totalPoints: 100 };
    const mockSubmission = { id: mockSubmissionId, labWorkId: mockWorkId };

    beforeEach(() => {
      // Setup default valid state for deeper logic testing
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue(
        mockSubmission,
      );
      (LabWorkRepository.findById as jest.Mock).mockResolvedValue(mockWork);
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });
    });

    it("should throw error if submission not found", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        GradingController.gradeSubmission("bad-id", mockUserEmail, 90, "Good"),
      ).rejects.toThrow("Submission not found");
    });

    it("should throw error if grade is negative", async () => {
      await expect(
        GradingController.gradeSubmission(
          mockSubmissionId,
          mockUserEmail,
          -5,
          "Bad",
        ),
      ).rejects.toThrow("Grade must be between 0 and 100");
    });

    it("should throw error if grade exceeds total points", async () => {
      await expect(
        GradingController.gradeSubmission(
          mockSubmissionId,
          mockUserEmail,
          101,
          "Bonus?",
        ),
      ).rejects.toThrow("Grade must be between 0 and 100");
    });

    it("should update grade successfully", async () => {
      (SubmissionRepository.grade as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        grade: 95,
        status: "RETURNED",
      });

      const result = await GradingController.gradeSubmission(
        mockSubmissionId,
        mockUserEmail,
        95,
        "Great job",
      );

      expect(SubmissionRepository.grade).toHaveBeenCalledWith(
        mockSubmissionId,
        95,
        "Great job",
      );
      expect(result.grade).toBe(95);
    });
  });
});
