import {
  WorkRepository,
  UpdateWorkPayload,
} from "@/repositories/WorkRepository";
import { db } from "@/models/models";

// Mock the transaction
const mockTx = {
  work: { update: jest.fn().mockResolvedValue({ id: "work-1" }) },
  task: {
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: "new-task-id" }),
  },
  editor: {
    updateMany: jest.fn(),
    create: jest.fn(),
  },
  testCase: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  hint: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  enrollment: { findMany: jest.fn().mockResolvedValue([]) },
  submission: { createMany: jest.fn() },
};

jest.mock("@/models/models", () => ({
  db: {
    $transaction: jest.fn((callback) => callback(mockTx)),
  },
}));

describe("WorkRepository - updateWorkTransaction", () => {
  const payload: UpdateWorkPayload = {
    workId: "work-1",
    labId: "lab-1",
    title: "Updated Title",
    totalPoints: 50,
    tasks: [
      {
        id: "task-1", // Existing task
        title: "T1 Updated",
        description: "D1",
        starterCode: "print()",
        point: 25,
        testCases: [],
        hints: [],
      },
      {
        // New task (no ID)
        title: "T2 New",
        description: "D2",
        starterCode: "return 0",
        point: 25,
        testCases: [],
        hints: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute transaction and handle both updates and creations", async () => {
    await WorkRepository.updateWorkTransaction(payload);

    expect(db.$transaction).toHaveBeenCalled();

    // 1. Check Work Update
    expect(mockTx.work.update).toHaveBeenCalledWith({
      where: { id: "work-1" },
      data: expect.objectContaining({ title: "Updated Title" }),
    });

    // 2. Check Deletion of removed tasks
    // It should delete tasks where ID is NOT in ["task-1"]
    expect(mockTx.task.deleteMany).toHaveBeenCalledWith({
      where: {
        workId: "work-1",
        id: { notIn: ["task-1"] },
      },
    });

    // 3. Check Update of Existing Task
    expect(mockTx.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({ title: "T1 Updated" }),
      }),
    );
    expect(mockTx.editor.updateMany).toHaveBeenCalled();

    // 4. Check Creation of New Task
    expect(mockTx.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "T2 New" }),
      }),
    );
  });
});
