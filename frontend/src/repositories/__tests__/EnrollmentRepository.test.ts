import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    enrollment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("EnrollmentRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create enrollment", async () => {
    await EnrollmentRepository.create("user@test.com", "lab-1");
    expect(db.enrollment.create).toHaveBeenCalledWith({
      data: { userEmail: "user@test.com", labId: "lab-1" },
    });
  });

  it("findByUserAndLab: should use composite key", async () => {
    await EnrollmentRepository.findByUserAndLab("user@test.com", "lab-1");
    expect(db.enrollment.findUnique).toHaveBeenCalledWith({
      where: {
        userEmail_labId: { userEmail: "user@test.com", labId: "lab-1" },
      },
    });
  });

  it("findAllByLabId: should include user data and sort", async () => {
    await EnrollmentRepository.findAllByLabId("lab-1");
    expect(db.enrollment.findMany).toHaveBeenCalledWith({
      where: { labId: "lab-1" },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });
  });

  it("delete: should delete unique enrollment", async () => {
    await EnrollmentRepository.delete("user@test.com", "lab-1");
    expect(db.enrollment.delete).toHaveBeenCalledWith({
      where: {
        userEmail_labId: { userEmail: "user@test.com", labId: "lab-1" },
      },
    });
  });

  it("deleteByLabId: should delete many", async () => {
    await EnrollmentRepository.deleteByLabId("lab-1");
    expect(db.enrollment.deleteMany).toHaveBeenCalledWith({
      where: { labId: "lab-1" },
    });
  });
});
