"use server";

import { revalidatePath } from "next/cache";
import { WorkController } from "@/controller/WorkController";

// DTO from Client Form
interface CreateWorkFormPayload {
  labId: string;
  userEmail: string;
  title: string;
  description: string;
  totalPoints: number;
  startTime: string;
  endTime: string;

  // Multiple Tasks
  tasks: Array<{
    title: string;
    description: string;
    pdfUrl?: string;
    starterCode: string;
    testCases: { input: string; expectOutput: string }[];
    hints: string[];
  }>;
}

export async function createLabWork(payload: CreateWorkFormPayload) {
  const { labId, userEmail, tasks } = payload;

  if (!payload.title || tasks.length === 0) {
    return { error: "Assignment title and at least one task are required." };
  }

  try {
    const repositoryPayload = {
      labId,
      title: payload.title,
      description: payload.description,
      totalPoints: payload.totalPoints,
      startTime: payload.startTime ? new Date(payload.startTime) : null,
      endTime: payload.endTime ? new Date(payload.endTime) : null,
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        pdfUrl: t.pdfUrl,
        starterCode: t.starterCode,
        point: Math.floor(payload.totalPoints / tasks.length), // Distribute points evenly
        testCases: t.testCases,
        hints: t.hints,
      })),
    };

    await WorkController.createAssignment(repositoryPayload, userEmail);

    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create assignment:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to save assignment." };
  }
}
