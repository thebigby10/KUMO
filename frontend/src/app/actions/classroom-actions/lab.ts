"use server";

import { LabController } from "@/controller/LabController";
import { revalidatePath } from "next/cache";

export async function createLab(formData: FormData, userEmail: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;
  const subject = formData.get("subject") as string;
  const room = formData.get("room") as string;

  if (!name || !userEmail) {
    return { error: "Class name and User are required" };
  }

  try {
    const newLab = await LabController.create(
      { name, section, subject, room },
      userEmail
    );

    revalidatePath("/dashboard");
    return { success: true, lab: newLab };

  } catch (error) {
    console.error("Failed to create lab:", error);
    return { error: "Failed to create lab" };
  }
}

export async function joinLab(formData: FormData, userEmail: string) {
  const labCode = formData.get("labCode") as string;

  if (!labCode || !userEmail) {
    return { error: "Class code is required" };
  }

  try {
    await LabController.join(labCode, userEmail);

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Failed to join lab:", error);
    const message = error instanceof Error ? error.message : "Failed to join class. Please try again.";
    return { error: message };
  }
}

export async function removeStudent(labId: string, studentEmail: string) {
  const { getCurrentUser } = await import("../auth");
  const user = await getCurrentUser();
  
  if (!user?.email) {
    return { error: "Not authenticated" };
  }

  try {
    await LabController.removeStudent(labId, user.email, studentEmail);
    
    revalidatePath(`/dashboard/lab/${labId}/people`);
    return { success: true };

  } catch (error) {
    console.error("Failed to remove student:", error);
    const message = error instanceof Error ? error.message : "Failed to remove student";
    return { error: message };
  }
}

export async function addInstructor(labId: string, instructorEmail: string) {
  const { getCurrentUser } = await import("../auth");
  const user = await getCurrentUser();
  
  if (!user?.email) {
    return { error: "Not authenticated" };
  }

  if (!instructorEmail || !instructorEmail.includes("@")) {
    return { error: "Please enter a valid email address" };
  }

  try {
    await LabController.addInstructor(labId, user.email, instructorEmail);
    
    revalidatePath(`/dashboard/lab/${labId}/people`);
    return { success: true };

  } catch (error) {
    console.error("Failed to add instructor:", error);
    const message = error instanceof Error ? error.message : "Failed to add instructor";
    return { error: message };
  }
}