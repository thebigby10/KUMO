import { createLab, joinLab } from "@/actions/classroom-actions/lab";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache"; // Import to use in assertions if needed, though we mock it below

// 1. Mock Next.js cache to prevent "Invariant: static generation store missing" error
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// 2. Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    lab: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    enrollment: {
      create: jest.fn(),
    },
  },
}));

// 3. Mock Controller
jest.mock("@/controller/LabController", () => ({
  LabController: {
    deleteLab: jest.fn(),
    getPeople: jest.fn(),
    updateLab: jest.fn(),
  },
}));

describe("Classroom Actions", () => {
  const mockUserEmail = "teacher@test.com";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createLab", () => {
    it("should return error if name is missing", async () => {
      const formData = new FormData();
      formData.append("section", "A");

      const result = await createLab(formData, mockUserEmail);
      expect(result.error).toContain("required");
    });

    it("should create lab and return success", async () => {
      const formData = new FormData();
      formData.append("name", "Physics");
      formData.append("section", "101");

      (prisma.lab.create as jest.Mock).mockResolvedValue({
        id: "lab-1",
        name: "Physics",
      });

      const result = await createLab(formData, mockUserEmail);

      expect(prisma.lab.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Physics",
            section: "101",
            instructors: {
              create: { userEmail: mockUserEmail, role: "OWNER" },
            },
          }),
        }),
      );
      // Ensure the mock was called, confirming the action completed successfully
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result.success).toBe(true);
      expect(result.lab).toBeDefined();
    });
  });

  describe("joinLab", () => {
    it("should return error if code is missing", async () => {
      const formData = new FormData();
      const result = await joinLab(formData, mockUserEmail);
      expect(result.error).toContain("required");
    });

    it("should return error if lab not found", async () => {
      const formData = new FormData();
      formData.append("labCode", "INVALID");

      (prisma.lab.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await joinLab(formData, mockUserEmail);
      expect(result.error).toContain("not found");
    });

    it("should return error if user is already instructor", async () => {
      const formData = new FormData();
      formData.append("labCode", "ABC");

      (prisma.lab.findUnique as jest.Mock).mockResolvedValue({
        id: "lab-1",
        instructors: [{ userEmail: mockUserEmail }],
        enrollments: [],
      });

      const result = await joinLab(formData, mockUserEmail);
      expect(result.error).toContain("already teaching");
    });

    it("should create enrollment on success", async () => {
      const formData = new FormData();
      formData.append("labCode", "ABC");

      (prisma.lab.findUnique as jest.Mock).mockResolvedValue({
        id: "lab-1",
        instructors: [],
        enrollments: [],
      });

      const result = await joinLab(formData, mockUserEmail);

      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: { userEmail: mockUserEmail, labId: "lab-1" },
      });

      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result.success).toBe(true);
    });
  });
});
