"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

function generateLabCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createLab(formData: FormData, userEmail: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;
  const subject = formData.get("subject") as string;
  const room = formData.get("room") as string;

  if (!name || !userEmail) {
    return { error: "Class name and User are required" };
  }

  try {
    const newLab = await prisma.lab.create({
      data: {
        name,
        section,
        subject,
        room,
        labCode: generateLabCode(),
        instructors: {
          create: {
            userEmail: userEmail,
            role: "OWNER"
          }
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true, lab: newLab };

  } catch (error) {
    console.error("Failed to create lab:", error);
    return { error: "Failed to create lab" };
  }
}