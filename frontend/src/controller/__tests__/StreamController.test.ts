import { StreamController } from "@/controller/StreamController";
import { AnnouncementRepository } from "@/repositories/AnnouncementRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";

jest.mock("@/repositories/AnnouncementRepository");
jest.mock("@/repositories/EnrollmentRepository");
jest.mock("@/repositories/InstructorRepository");

describe("StreamController", () => {
  const labId = "lab-1";
  const userEmail = "user@test.com";
  const content = "Hello class";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAnnouncement", () => {
    it("should throw error if content is empty", async () => {
      await expect(
        StreamController.createAnnouncement(labId, userEmail, "   "),
      ).rejects.toThrow("Content cannot be empty");
    });

    it("should throw error if user is neither enrolled nor instructor", async () => {
      // Mock both checks returning null
      (EnrollmentRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        StreamController.createAnnouncement(labId, userEmail, content),
      ).rejects.toThrow("You are not a member of this class");
    });

    it("should allow enrolled student to post", async () => {
      // Mock student found, instructor null
      (EnrollmentRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "1",
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );

      await StreamController.createAnnouncement(labId, userEmail, content);

      expect(AnnouncementRepository.create).toHaveBeenCalledWith(
        labId,
        userEmail,
        content,
      );
    });

    it("should allow instructor to post", async () => {
      // Mock student null, instructor found
      (EnrollmentRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "1",
      });

      await StreamController.createAnnouncement(labId, userEmail, content);

      expect(AnnouncementRepository.create).toHaveBeenCalledWith(
        labId,
        userEmail,
        content,
      );
    });
  });

  describe("deleteAnnouncement", () => {
    it("should throw if announcement not found", async () => {
      (AnnouncementRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        StreamController.deleteAnnouncement("bad-id", userEmail),
      ).rejects.toThrow("Announcement not found");
    });

    it("should allow owner of post to delete", async () => {
      (AnnouncementRepository.findById as jest.Mock).mockResolvedValue({
        id: "1",
        postedBy: userEmail,
        labId,
      });

      await StreamController.deleteAnnouncement("1", userEmail);
      expect(AnnouncementRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should allow instructor to delete any post", async () => {
      (AnnouncementRepository.findById as jest.Mock).mockResolvedValue({
        id: "1",
        postedBy: "student@test.com",
        labId,
      });
      // User is NOT the poster, but IS the instructor
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue({
        id: "inst-1",
      });

      await StreamController.deleteAnnouncement("1", userEmail);
      expect(AnnouncementRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should deny random student from deleting others' posts", async () => {
      (AnnouncementRepository.findById as jest.Mock).mockResolvedValue({
        id: "1",
        postedBy: "other@test.com",
        labId,
      });
      (InstructorRepository.findByUserAndLab as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        StreamController.deleteAnnouncement("1", userEmail),
      ).rejects.toThrow("Unauthorized to delete this post");
    });
  });
});
