import { WorkController } from "@/controller/WorkController";
import { InstructorRepository } from "@/repositories/InstructorRepository";
// We must mock the db import to stop it from hitting the real database
import { db } from "@/models/models";

jest.mock("@/repositories/InstructorRepository");
jest.mock("@/models/models", () => ({
  db: {
    $transaction: jest.fn((callback) => callback(mockTx)), // Immediately execute the callback
  },
}));

// Create a mock transaction client
const mockTx = {
  labWork: { create: jest.fn().mockResolvedValue({ id: "work-1" }) },
  labTask: { create: jest.fn().mockResolvedValue({ id: "task-1" }) },
  editor: { create: jest.fn() },
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
        language: "python",
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

    await expect(WorkController.createAssignment(payload)).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("should fail if no tasks provided", async () => {
    (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
      id: "1",
    });

    await expect(
      WorkController.createAssignment({ ...payload, tasks: [] }),
    ).rejects.toThrow("At least one task is required");
  });

  it("should execute transaction if authorized", async () => {
    (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
      id: "1",
    });

    await WorkController.createAssignment(payload);

    // Verify transaction was called
    expect(db.$transaction).toHaveBeenCalled();

    // Verify steps inside the transaction mock
    expect(mockTx.labWork.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "Test Lab" }),
      }),
    );

    expect(mockTx.labTask.create).toHaveBeenCalled();
    expect(mockTx.editor.create).toHaveBeenCalled();
  });
});
