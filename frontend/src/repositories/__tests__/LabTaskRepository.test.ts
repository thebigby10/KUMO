import { LabTaskRepository } from "@/repositories/LabTaskRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    labTask: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("LabTaskRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create task", async () => {
    const data: any = { title: "Task 1", labWorkId: "work-1", point: 10 };
    await LabTaskRepository.create(data);
    expect(db.labTask.create).toHaveBeenCalledWith({ data });
  });

  it("findAllByWorkId: should find by labWorkId", async () => {
    await LabTaskRepository.findAllByWorkId("work-1");
    expect(db.labTask.findMany).toHaveBeenCalledWith({
      where: { labWorkId: "work-1" },
    });
  });

  it("deleteManyByWorkId: should delete by labWorkId", async () => {
    await LabTaskRepository.deleteManyByWorkId("work-1");
    expect(db.labTask.deleteMany).toHaveBeenCalledWith({
      where: { labWorkId: "work-1" },
    });
  });
});
