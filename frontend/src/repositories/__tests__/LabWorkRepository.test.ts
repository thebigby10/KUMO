import { LabWorkRepository } from "@/repositories/LabWorkRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    labWork: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("LabWorkRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create work", async () => {
    const data: any = { title: "Work 1", labId: "lab-1", totalPoints: 100 };
    await LabWorkRepository.create(data);
    expect(db.labWork.create).toHaveBeenCalledWith({ data });
  });

  it("findById: should include tasks and editors", async () => {
    await LabWorkRepository.findById("work-1");
    expect(db.labWork.findUnique).toHaveBeenCalledWith({
      where: { id: "work-1" },
      include: {
        tasks: {
          include: { editors: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  it("findAllByLabId: should include tasks", async () => {
    await LabWorkRepository.findAllByLabId("lab-1");
    expect(db.labWork.findMany).toHaveBeenCalledWith({
      where: { labId: "lab-1" },
      orderBy: { createdAt: "desc" },
      include: { tasks: true },
    });
  });

  it("update: should update work", async () => {
    await LabWorkRepository.update("work-1", { title: "New Title" });
    expect(db.labWork.update).toHaveBeenCalledWith({
      where: { id: "work-1" },
      data: { title: "New Title" },
    });
  });

  it("delete: should delete work", async () => {
    await LabWorkRepository.delete("work-1");
    expect(db.labWork.delete).toHaveBeenCalledWith({
      where: { id: "work-1" },
    });
  });
});
