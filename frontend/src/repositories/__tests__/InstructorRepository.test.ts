import { InstructorRepository } from "@/repositories/InstructorRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    instructor: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("InstructorRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create instructor with default role ASSISTANT", async () => {
    await InstructorRepository.create("user@test.com", "lab-1");
    expect(db.instructor.create).toHaveBeenCalledWith({
      data: { userEmail: "user@test.com", labId: "lab-1", role: "ASSISTANT" },
    });
  });

  it("create: should create instructor with specified role", async () => {
    await InstructorRepository.create("user@test.com", "lab-1", "OWNER");
    expect(db.instructor.create).toHaveBeenCalledWith({
      data: { userEmail: "user@test.com", labId: "lab-1", role: "OWNER" },
    });
  });

  it("findByUserAndLab: should use composite key", async () => {
    await InstructorRepository.findByUserAndLab("user@test.com", "lab-1");
    expect(db.instructor.findUnique).toHaveBeenCalledWith({
      where: {
        labId_userEmail: { labId: "lab-1", userEmail: "user@test.com" },
      },
    });
  });

  it("findAllByLabId: should find by labId", async () => {
    await InstructorRepository.findAllByLabId("lab-1");
    expect(db.instructor.findMany).toHaveBeenCalledWith({
      where: { labId: "lab-1" },
      include: { user: true },
    });
  });

  it("delete: should delete unique instructor", async () => {
    await InstructorRepository.delete("user@test.com", "lab-1");
    expect(db.instructor.delete).toHaveBeenCalledWith({
      where: {
        labId_userEmail: { labId: "lab-1", userEmail: "user@test.com" },
      },
    });
  });
});
