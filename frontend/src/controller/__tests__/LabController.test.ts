import { LabController } from "@/controller/LabController";
import { LabRepository } from "@/repositories/LabRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";

// 1. Mock the repositories
jest.mock("@/repositories/LabRepository");
jest.mock("@/repositories/EnrollmentRepository");
jest.mock("@/repositories/InstructorRepository");

describe("LabController", () => {
  const mockUserEmail = "teacher@test.com";
  const mockStudentEmail = "student@test.com";

  afterEach(() => {
    jest.clearAllMocks(); // Clear call history between tests
  });

  describe("create", () => {
    it("should create a lab with valid data", async () => {
      // Setup mock return
      (LabRepository.create as jest.Mock).mockResolvedValue({
        id: "123",
        name: "Physics",
      });

      const result = await LabController.create(
        { name: "Physics", section: "A" },
        mockUserEmail,
      );

      // Check if repository was called with correct structure
      expect(LabRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Physics",
          section: "A",
          labCode: expect.any(String), // Ensure code was generated
          instructors: {
            create: { userEmail: mockUserEmail, role: "OWNER" },
          },
        }),
      );
      expect(result).toEqual({ id: "123", name: "Physics" });
    });

    it("should throw error if name is missing", async () => {
      await expect(
        LabController.create({ name: "" }, mockUserEmail),
      ).rejects.toThrow("Class name and User are required");
    });
  });

  describe("join", () => {
    it("should throw error if class not found", async () => {
      (LabRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(
        LabController.join("INVALID_CODE", mockStudentEmail),
      ).rejects.toThrow("Class not found");
    });

    it("should throw error if user is already an instructor", async () => {
      // Mock lab found
      (LabRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "lab-1",
      });
      // Mock instructor found
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });

      await expect(
        LabController.join("VALID_CODE", mockUserEmail),
      ).rejects.toThrow("You are already teaching this class");
    });

    it("should throw error if user is already enrolled", async () => {
      // Mock lab found
      (LabRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "lab-1",
      });
      // Mock instructor NOT found
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );
      // Mock enrollment found
      (EnrollmentRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "enroll-1",
      });

      await expect(
        LabController.join("VALID_CODE", mockStudentEmail),
      ).rejects.toThrow("You are already enrolled");
    });

    it("should successfully join if checks pass", async () => {
      (LabRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "lab-1",
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );
      (EnrollmentRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );
      (EnrollmentRepository.create as jest.Mock).mockResolvedValue({
        id: "new-enrollment",
      });

      const result = await LabController.join("VALID_CODE", mockStudentEmail);

      expect(EnrollmentRepository.create).toHaveBeenCalledWith(
        mockStudentEmail,
        "lab-1",
      );
      expect(result).toEqual({ id: "new-enrollment" });
    });
  });
});
