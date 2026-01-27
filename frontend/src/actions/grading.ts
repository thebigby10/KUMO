"use server";

import { revalidatePath } from "next/cache";
import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { getCurrentUser } from "./auth";

export async function gradeTaskAction(
  submissionId: string,
  labId: string,
  workId: string,
  grade: number,
  feedback: string,
) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  // Permission Check
  const instructor = await InstructorRepository.findByUserAndLab(
    user.email,
    labId,
  );
  if (!instructor) return { error: "Only instructors can grade." };

  try {
    await SubmissionRepository.gradeById(submissionId, grade, feedback || undefined);

    // Revalidate the grading page so UI updates cleanly
    revalidatePath(`/dashboard/lab/${labId}/work/${workId}/grade`);
    revalidatePath(`/dashboard/lab/${labId}/work/${workId}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Grading failed:", error);
    return { error: "Failed to save grade" };
  }
}
