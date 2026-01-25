import {
  WorkRepository,
  CreateWorkPayload,
} from "@/repositories/WorkRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";

export class WorkController {
  // --- CREATE ---
  static async createAssignment(payload: CreateWorkPayload, userEmail: string) {
    const { labId, tasks } = payload;

    // 1. Authorization
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );
    if (!instructor)
      throw new Error("Unauthorized: Only instructors can create assignments");

    if (tasks.length === 0) throw new Error("At least one task is required");

    // 2. Delegate to Repository
    return await WorkRepository.createWithTasks(payload);
  }

  // --- READ ---
  static async getWorkById(workId: string) {
    return await WorkRepository.findById(workId);
  }

  // --- DELETE ---
  static async deleteWork(workId: string, userEmail: string) {
    const work = await WorkRepository.findById(workId);
    if (!work) throw new Error("Assignment not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    return await WorkRepository.delete(workId);
  }

  static async updateWork(
    workId: string,
    userEmail: string,
    data: { title?: string; description?: string; endTime?: Date },
  ) {
    const work = await WorkRepository.findById(workId);
    if (!work) throw new Error("Work not found");

    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      work.labId,
    );
    if (!instructor) throw new Error("Unauthorized");

    return await WorkRepository.update(workId, data);
  }
}
