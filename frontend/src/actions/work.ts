"use server";

import { revalidatePath } from "next/cache";
import { WorkController } from "@/controller/WorkController";

// Define the shape of the data coming from the form
interface CreateWorkFormPayload {
  labId: string;
  userEmail: string;
  title: string;
  description: string;
  totalPoints: number;
  endTime: Date | null;
  tasks: {
    title: string;
    description: string;
    starterCode: string;
    language: string;
  }[];
}

export async function createLabWork(payload: CreateWorkFormPayload) {
  const { labId, userEmail, tasks } = payload;

  if (!payload.title || tasks.length === 0) {
    return { error: "Title and at least one task are required." };
  }

  try {
    // Map the form payload to the Repository format
    const repositoryPayload = {
      labId,
      title: payload.title,
      description: payload.description,
      totalPoints: payload.totalPoints,
      endTime: payload.endTime,
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        point: Math.floor(payload.totalPoints / tasks.length),
        url: t.language,
        starterCode: t.starterCode,
      })),
    };

    // Use Controller
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
