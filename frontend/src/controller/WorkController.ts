import { WorkRepository } from "@/repositories/WorkRepository";
import { LabRepository } from "@/repositories/LabRepository";

export interface CreateWorkDTO {
  labId: string;
  userEmail: string;
  title: string;
  description?: string;
  totalPoints: number;
  endTime?: Date | null;
  tasks: {
    title: string;
    description: string;
    starterCode: string;
    language: string;
  }[];
}

export class WorkController {
  static async createAssignment(payload: CreateWorkDTO) {
    const {
      labId,
      userEmail,
      title,
      description,
      totalPoints,
      endTime,
      tasks,
    } = payload;

    // 1. Authorization Logic
    // We reuse LabRepository because checking instructor status is a Lab-related query
    const instructor = await LabRepository.findInstructor(labId, userEmail);

    if (!instructor)
      throw new Error("Unauthorized: Only instructors can create assignments");

    if (tasks.length === 0) throw new Error("At least one task is required");

    // 2. Prepare Transaction Data
    const transactionData = {
      labId,
      title,
      description,
      totalPoints,
      endTime,
      tasks: tasks.map((task) => ({
        ...task,
        point: Math.floor(totalPoints / tasks.length), // Logic: Calculate points per task
      })),
    };

    // 3. Persist
    return await WorkRepository.createWorkTransaction(transactionData);
  }

  static async getWorkById(workId: string) {
    return await WorkRepository.findById(workId);
  }
}
