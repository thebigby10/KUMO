"use server";

import { revalidatePath } from "next/cache";
import { StreamController } from "@/controller/AnnouncementController";

export async function createAnnouncement(formData: FormData, labId: string, userEmail: string) {
  const content = formData.get("content") as string;

  if (!content || !content.trim()) {
    return { error: "Content cannot be empty" };
  }

  try {
    await StreamController.createAnnouncement(labId, userEmail, content);

    revalidatePath(`/dashboard/lab/${labId}`);
    return { success: true };

  } catch (error) {
    console.error("Failed to post announcement:", error);
    const message = error instanceof Error ? error.message : "Failed to post announcement";
    return { error: message };
  }
}