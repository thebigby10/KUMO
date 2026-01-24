"use server";

import { revalidatePath } from "next/cache";
import { WorkController, CreateWorkDTO } from "@/controller/WorkController";

// Define the shape of the data coming from the form
interface CreateWorkPayload {
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

export async function createLabWork(payload: CreateWorkPayload) {
  const { labId, title, tasks } = payload;

  if (!title || tasks.length === 0) {
    return { error: "Title and at least one task are required." };
  }

  try {
    // Use the WorkController which handles authorization and transaction
    await WorkController.createAssignment(payload as CreateWorkDTO);

    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };

  } catch (error) {
    console.error("Failed to create assignment:", error);
    const message = error instanceof Error ? error.message : "Failed to save assignment.";
    return { error: message };
  }
}