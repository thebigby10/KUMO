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

export async function joinLab(formData: FormData, userEmail: string) {
  const labCode = formData.get("labCode") as string;

  if (!labCode || !userEmail) {
    return { error: "Class code is required" };
  }

  try {
    // 1. Find the lab by the unique code
    const lab = await prisma.lab.findUnique({
      where: { labCode },
      include: {
        instructors: true,
        enrollments: true,
      }
    });

    if (!lab) {
      return { error: "Class not found. Please check the code." };
    }

    // 2. Check: Is the user the Instructor?
    const isInstructor = lab.instructors.some(inst => inst.userEmail === userEmail);
    if (isInstructor) {
      return { error: "You are already teaching this class." };
    }

    // 3. Check: Is the user already enrolled?
    const isEnrolled = lab.enrollments.some(enroll => enroll.userEmail === userEmail);
    if (isEnrolled) {
      return { error: "You are already enrolled in this class." };
    }

    // 4. Create the Enrollment
    await prisma.enrollment.create({
      data: {
        userEmail: userEmail,
        labId: lab.id,
      }
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Failed to join lab:", error);
    return { error: "Failed to join class. Please try again." };
  }
}