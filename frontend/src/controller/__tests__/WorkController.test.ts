import { WorkController } from "@/controller/WorkController";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { db } from "@/models/models";

jest.mock("@/repositories/InstructorRepository");
jest.mock("@/models/models", () => ({
  db: {
    $transaction: jest.fn((callback) => callback(mockTx)),
  },
}));

const mockTx = {
  work: { create: jest.fn().mockResolvedValue({ id: "work-1" }) },
  task: { create: jest.fn().mockResolvedValue({ id: "task-1" }) },
  editor: { create: jest.fn() },
  testCase: { createMany: jest.fn() },
  hint: { createMany: jest.fn() },
  enrollment: { findMany: jest.fn().mockResolvedValue([]) }, // Mock enrollment query
  submission: { createMany: jest.fn() },
};

describe("WorkController", () => {
  const payload = {
    labId: "lab-1",
    userEmail: "prof@test.com",
    title: "Test Lab",
    totalPoints: 100,
    tasks: [
      {
        title: "T1",
        description: "D1",
        starterCode: "print()",
        point: 10,
        testCases: [],
        hints: [],
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fail if user is not instructor", async () => {
    (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      WorkController.createAssignment(payload, "prof@test.com"),
    ).rejects.toThrow("Unauthorized");
  });

  it("should execute transaction if authorized", async () => {
    (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
      id: "1",
    });

    await WorkController.createAssignment(payload, "prof@test.com");

    expect(db.$transaction).toHaveBeenCalled();
    expect(mockTx.work.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "Test Lab" }),
      }),
    );
    expect(mockTx.task.create).toHaveBeenCalled();
    expect(mockTx.editor.create).toHaveBeenCalled();
  });
});
