"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { redirect } from "next/navigation";

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
    starterCode: string; // We map this to the 'url' or 'description' field in DB, or simpler: just save code
    language: string;    // We need to store this somewhere. For now, we'll prepend it to description or use a new field if we migrate.
                         // Hack for now: Store language in the `url` field since we don't have a distinct language column yet.
  }[];
}

export async function createLabWork(payload: CreateWorkPayload) {
  const { labId, userEmail, title, description, totalPoints, endTime, tasks } = payload;

  if (!title || tasks.length === 0) {
    return { error: "Title and at least one task are required." };
  }

  try {
    // 1. Verify Permission
    const instructor = await prisma.instructor.findUnique({
      where: {
        labId_userEmail: { labId, userEmail }
      }
    });

    if (!instructor) {
      return { error: "Unauthorized" };
    }

    // 2. Transactional Write
    // We create the LabWork AND all its LabTasks in one go.
    await prisma.$transaction(async (tx) => {
      
      // A. Create the Parent (LabWork)
      const newWork = await tx.labWork.create({
        data: {
          labId,
          title,
          description,
          totalPoints,
          endTime,
        }
      });

      // B. Create the Children (LabTasks)
      for (const task of tasks) {
        // We are using the 'editors' table to store the starter code
        // Create the task
        const newTask = await tx.labTask.create({
          data: {
            labWorkId: newWork.id,
            title: task.title,
            description: task.description,
            point: Math.floor(totalPoints / tasks.length), // Distribute points evenly
            url: task.language, // Storing language here for now
          }
        });

        // Create the editor config (Starter Code)
        await tx.editor.create({
          data: {
            taskId: newTask.id,
            solution: task.starterCode, // This acts as our starter code
            url: "", // Not used yet
          }
        });
      }
    });

    // 3. Success & Redirect
    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };

  } catch (error) {
    console.error("Failed to create assignment:", error);
    return { error: "Failed to save assignment." };
  }
}