import { createLabWork } from "@/actions/work";
import { WorkController } from "@/controller/WorkController";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/controller/WorkController");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Work Actions", () => {
  const mockPayload = {
    labId: "lab-1",
    userEmail: "prof@test.com",
    title: "New Assignment",
    description: "Desc",
    totalPoints: 100,
    startTime: "",
    endTime: "",
    tasks: [
      {
        title: "Task 1",
        description: "Do X",
        starterCode: "print()",
        testCases: [],
        hints: [],
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if title is missing", async () => {
    const result = await createLabWork({ ...mockPayload, title: "" });
    expect(result.error).toContain("required");
    expect(WorkController.createAssignment).not.toHaveBeenCalled();
  });

  it("should return error if tasks are empty", async () => {
    const result = await createLabWork({ ...mockPayload, tasks: [] });
    expect(result.error).toContain("required");
  });

  it("should call Controller and revalidate path on success", async () => {
    (WorkController.createAssignment as jest.Mock).mockResolvedValue({
      id: "work-1",
    });

    const result = await createLabWork(mockPayload);

    expect(WorkController.createAssignment).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Assignment",
        labId: "lab-1",
      }),
      "prof@test.com",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/lab/lab-1/work");
    expect(result.success).toBe(true);
  });

  it("should handle controller errors gracefully", async () => {
    (WorkController.createAssignment as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await createLabWork(mockPayload);

    expect(result.error).toBe("Database error");
  });
});
