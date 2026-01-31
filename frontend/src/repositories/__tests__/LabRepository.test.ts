import { LabRepository } from "@/repositories/LabRepository";
import { db } from "@/models/models";

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
    work: { deleteMany: jest.fn() }, // Changed from labWork to work
    $transaction: jest.fn((operations) => Promise.resolve(operations)),
  },
}));

describe("LabRepository", () => {
  const mockLabId = "lab-123";

  it("delete: should execute a transaction", async () => {
    await LabRepository.delete(mockLabId);

    expect(db.$transaction).toHaveBeenCalled();
    expect(db.work.deleteMany).toHaveBeenCalledWith({
      where: { labId: mockLabId },
    });
    expect(db.lab.delete).toHaveBeenCalledWith({
      where: { id: mockLabId },
    });
  });
});
