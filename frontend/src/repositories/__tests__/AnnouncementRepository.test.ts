import { AnnouncementRepository } from "@/repositories/AnnouncementRepository";
import { db } from "@/models/models";

jest.mock("@/models/models", () => ({
  db: {
    announcement: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("AnnouncementRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create: should create announcement", async () => {
    await AnnouncementRepository.create("lab-1", "user@test.com", "Hello");
    expect(db.announcement.create).toHaveBeenCalledWith({
      data: { labId: "lab-1", postedBy: "user@test.com", content: "Hello" },
    });
  });

  it("findById: should find unique", async () => {
    await AnnouncementRepository.findById("id-1");
    expect(db.announcement.findUnique).toHaveBeenCalledWith({
      where: { id: "id-1" },
    });
  });

  it("findAllByLabId: should find many ordered by date", async () => {
    await AnnouncementRepository.findAllByLabId("lab-1");
    expect(db.announcement.findMany).toHaveBeenCalledWith({
      where: { labId: "lab-1" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("update: should update content", async () => {
    await AnnouncementRepository.update("id-1", "Updated");
    expect(db.announcement.update).toHaveBeenCalledWith({
      where: { id: "id-1" },
      data: { content: "Updated" },
    });
  });

  it("delete: should delete unique", async () => {
    await AnnouncementRepository.delete("id-1");
    expect(db.announcement.delete).toHaveBeenCalledWith({
      where: { id: "id-1" },
    });
  });
});
