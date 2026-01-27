"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";

export async function createAnnouncement(formData: FormData, labId: string, userEmail: string) {
  const content = formData.get("content") as string;

  if (!content || !content.trim()) {
    return { error: "Content cannot be empty" };
  }

  try {
    // 1. Verify user is actually in the lab (Security Check)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userEmail_labId: { userEmail, labId }
      }
    });
    
    const instructor = await prisma.instructor.findUnique({
      where: {
        labId_userEmail: { labId, userEmail }
      }
    });

    if (!enrollment && !instructor) {
      return { error: "You are not a member of this class" };
    }

    // 2. Create the Announcement
    await prisma.announcement.create({
      data: {
        content: content,
        labId: labId,
        postedBy: userEmail,
      }
    });

    // 3. Refresh the page to show the new post
    revalidatePath(`/dashboard/lab/${labId}`);
    return { success: true };

  } catch (error) {
    console.error("Failed to post announcement:", error);
    return { error: "Failed to post announcement" };
  }
}