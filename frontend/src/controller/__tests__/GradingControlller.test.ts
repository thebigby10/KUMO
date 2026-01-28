import { GradingController } from "@/controller/GradingController";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { WorkRepository } from "@/repositories/WorkRepository";

// Mocks
jest.mock("@/repositories/SubmissionRepository", () => ({
  SubmissionRepository: {
    findAllByWorkId: jest.fn(),
    findById: jest.fn(),
    gradeById: jest.fn(),
  },
}));

jest.mock("@/repositories/InstructorRepository", () => ({
  InstructorRepository: {
    findByUserAndLab: jest.fn(),
  },
}));

jest.mock("@/repositories/WorkRepository", () => ({
  WorkRepository: {
    findById: jest.fn(),
  },
}));

describe("GradingController", () => {
  const mockUserEmail = "instructor@test.com";
  const mockWorkId = "work-123";
  const mockSubmissionId = "sub-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSubmissionsForWork", () => {
    it("should return submissions if authorized", async () => {
      // Mock Work Found
      (WorkRepository.findById as jest.Mock).mockResolvedValue({
        id: mockWorkId,
        labId: "lab-1",
      });
      // Mock Instructor Authorized
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });
      // Mock Submissions
      const mockSubmissions = [{ id: "sub-1" }];
      (SubmissionRepository.findAllByWorkId as jest.Mock).mockResolvedValue(
        mockSubmissions,
      );

      const result = await GradingController.getSubmissionsForWork(
        mockWorkId,
        mockUserEmail,
      );

      expect(result).toEqual(mockSubmissions);
      expect(WorkRepository.findById).toHaveBeenCalledWith(mockWorkId);
    });
  });

  describe("gradeSubmission", () => {
    it("should update grade successfully", async () => {
      (SubmissionRepository.findById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        workId: mockWorkId,
      });
      (WorkRepository.findById as jest.Mock).mockResolvedValue({
        id: mockWorkId,
        labId: "lab-1",
        totalPoints: 100,
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });
      (SubmissionRepository.gradeById as jest.Mock).mockResolvedValue({
        id: mockSubmissionId,
        grade: 90,
      });

      await GradingController.gradeSubmission(
        mockSubmissionId,
        mockUserEmail,
        90,
        "Good",
      );

      expect(SubmissionRepository.gradeById).toHaveBeenCalledWith(
        mockSubmissionId,
        90,
        "Good",
      );
    });
  });
});
