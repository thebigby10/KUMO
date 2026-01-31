import { TaskRepository } from "@/repositories/TaskRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    editor: { deleteMany: jest.fn() },
    testCase: { deleteMany: jest.fn() },
    hint: { deleteMany: jest.fn() },
    submission: { deleteMany: jest.fn() },
    $transaction: jest.fn((cb) => cb(db)),
  },
}));

describe("TaskRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create task", async () => {
    const data: any = { title: "Task 1", workId: "work-1", point: 10 };
    await TaskRepository.create(data);
    expect(db.task.create).toHaveBeenCalledWith({ data });
  });

  it("findAllByWorkId: should find by workId", async () => {
    await TaskRepository.findAllByWorkId("work-1");
    expect(db.task.findMany).toHaveBeenCalledWith({
      where: { workId: "work-1" },
      include: { editors: true, testCases: true },
      orderBy: { createdAt: "asc" },
    });
  });
});
