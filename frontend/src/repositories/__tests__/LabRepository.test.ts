import { LabRepository } from "@/repositories/LabRepository";
import { db } from "@/models/models";

// 1. Mock the Prisma Client Module
// We return a mock object that mimics the structure of your PrismaClient
jest.mock("@/models/models", () => ({
  db: {
    lab: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    enrollment: { deleteMany: jest.fn() },
    instructor: { deleteMany: jest.fn() },
    announcement: { deleteMany: jest.fn() },
    labWork: { deleteMany: jest.fn() },
    $transaction: jest.fn((operations) => Promise.resolve(operations)),
  },
}));

describe("LabRepository", () => {
  const mockLabId = "lab-123";
  const mockUserEmail = "test@example.com";

  // Clear mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call db.lab.create with correct data", async () => {
      const inputData = { name: "Chemistry 101" };
      const mockCreatedLab = { id: mockLabId, ...inputData };

      (db.lab.create as jest.Mock).mockResolvedValue(mockCreatedLab);

      const result = await LabRepository.create(inputData);

      expect(db.lab.create).toHaveBeenCalledWith({ data: inputData });
      expect(result).toEqual(mockCreatedLab);
    });
  });

  describe("findById", () => {
    it("should call db.lab.findUnique with the correct ID", async () => {
      await LabRepository.findById(mockLabId);

      expect(db.lab.findUnique).toHaveBeenCalledWith({
        where: { id: mockLabId },
      });
    });
  });

  describe("findByCode", () => {
    it("should call db.lab.findUnique with the correct labCode", async () => {
      const code = "ABC-XYZ";
      await LabRepository.findByCode(code);

      expect(db.lab.findUnique).toHaveBeenCalledWith({
        where: { labCode: code },
      });
    });
  });

  describe("findAllRelatedToUser", () => {
    it("should construct the correct OR query and include clauses", async () => {
      await LabRepository.findAllRelatedToUser(mockUserEmail);

      // This verifies the complex "OR" logic in your repository
      expect(db.lab.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { instructors: { some: { userEmail: mockUserEmail } } },
            { enrollments: { some: { userEmail: mockUserEmail } } },
          ],
        },
        include: {
          instructors: {
            where: { role: "OWNER" },
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("update", () => {
    it("should call db.lab.update with correct ID and data", async () => {
      const updateData = { name: "New Name" };
      await LabRepository.update(mockLabId, updateData);

      expect(db.lab.update).toHaveBeenCalledWith({
        where: { id: mockLabId },
        data: updateData,
      });
    });
  });

  describe("archive", () => {
    it("should call update specifically for isArchived field", async () => {
      await LabRepository.archive(mockLabId, true);

      expect(db.lab.update).toHaveBeenCalledWith({
        where: { id: mockLabId },
        data: { isArchived: true },
      });
    });
  });

  describe("delete", () => {
    it("should execute a transaction containing all cleanup operations", async () => {
      // Execute the repository function
      await LabRepository.delete(mockLabId);

      // 1. Verify db.$transaction was called
      expect(db.$transaction).toHaveBeenCalled();

      // 2. Verify all dependent deleteMany calls were made with the correct labId
      expect(db.enrollment.deleteMany).toHaveBeenCalledWith({
        where: { labId: mockLabId },
      });
      expect(db.instructor.deleteMany).toHaveBeenCalledWith({
        where: { labId: mockLabId },
      });
      expect(db.announcement.deleteMany).toHaveBeenCalledWith({
        where: { labId: mockLabId },
      });
      expect(db.labWork.deleteMany).toHaveBeenCalledWith({
        where: { labId: mockLabId },
      });

      // 3. Verify the final lab deletion
      expect(db.lab.delete).toHaveBeenCalledWith({
        where: { id: mockLabId },
      });
    });
  });
});
