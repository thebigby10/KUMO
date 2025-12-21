"use server";

import { revalidatePath } from "next/cache";
import { WorkController } from "@/controller/WorkController";
import { WorkRepository } from "@/repositories/WorkRepository"; // [FIX] Added import
import { InstructorRepository } from "@/repositories/InstructorRepository"; // [FIX] Added for permission check
import { getCurrentUser } from "@/actions/auth";

// --- AI Assistant Ingestion (best-effort, non-blocking) ---
const AI_ASSISTANT_URL = process.env.AI_ASSISTANT_URL || "http://localhost:8003";

async function triggerPdfIngestion(taskId: string, pdfUrl: string) {
  try {
    await fetch(`${AI_ASSISTANT_URL}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId, pdf_url: pdfUrl }),
    });
  } catch (error) {
    // Ingestion failure should never break work creation/editing
    console.error(`AI ingestion failed for task ${taskId}:`, error);
  }
}

// --- CREATE Types ---
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
    language: string;
    starterCode: string;
    testCases: { input: string; expectOutput: string }[];
    hints: string[];
  }>;
}

// --- CREATE Action ---
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
        language: t.language || "python",
        starterCode: t.starterCode,
        point: Math.floor(payload.totalPoints / tasks.length), // Distribute points evenly
        testCases: t.testCases,
        hints: t.hints,
      })),
    };

    const createdWork = await WorkController.createAssignment(repositoryPayload, userEmail);

    // Trigger AI ingestion for tasks that have PDF URLs (best-effort, non-blocking)
    if (createdWork && createdWork.tasks) {
      for (const task of createdWork.tasks) {
        if (task.url) {
          triggerPdfIngestion(task.id, task.url).catch(() => {});
        }
      }
    }

    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };
  } catch (error) {
    // console.error("Failed to create assignment:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to save assignment." };
  }
}

// --- EDIT Types ---
interface EditWorkFormPayload {
  workId: string;
  labId: string;
  userEmail: string;
  title: string;
  description: string;
  totalPoints: number;
  startTime: string;
  endTime: string;
  tasks: Array<{
    id?: string; // Optional for new tasks added during edit
    title: string;
    description: string;
    pdfUrl?: string;
    language: string;
    starterCode: string;
    testCases: { input: string; expectOutput: string }[];
    hints: string[];
  }>;
}

// --- EDIT Action ---
export async function editLabWork(payload: EditWorkFormPayload) {
  const { workId, labId, userEmail, tasks } = payload;

  if (!payload.title || tasks.length === 0) {
    return { error: "Assignment title and at least one task are required." };
  }

  try {
    // 1. Verify existence
    const work = await WorkRepository.findById(workId);
    if (!work) return { error: "Work not found" };

    // 2. Authorization check
    const instructor = await InstructorRepository.findByUserAndLab(
      userEmail,
      labId,
    );
    if (!instructor) return { error: "Unauthorized" };

    const repositoryPayload = {
      workId,
      labId,
      title: payload.title,
      description: payload.description,
      totalPoints: payload.totalPoints,
      startTime: payload.startTime ? new Date(payload.startTime) : null,
      endTime: payload.endTime ? new Date(payload.endTime) : null,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        pdfUrl: t.pdfUrl,
        language: t.language || "python",
        starterCode: t.starterCode,
        point: Math.floor(payload.totalPoints / tasks.length),
        testCases: t.testCases,
        hints: t.hints,
      })),
    };

    const updatedWork = await WorkRepository.updateWorkTransaction(repositoryPayload);

    // Trigger AI ingestion for tasks with PDF URLs after edit (re-ingests on update)
    if (updatedWork && updatedWork.tasks) {
      for (const task of updatedWork.tasks) {
        if (task.url) {
          triggerPdfIngestion(task.id, task.url).catch(() => {});
        }
      }
    }

    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };
  } catch (error) {
    console.error("Failed to edit assignment:", error);
    return { error: "Failed to update assignment." };
  }
}

// --- DELETE Action ---
export async function deleteWorkAction(workId: string, labId: string) {
  const user = await getCurrentUser();

  if (!user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    await WorkController.deleteWork(workId, user.email);
    revalidatePath(`/dashboard/lab/${labId}/work`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete work:", error);
    return { error: "Failed to delete assignment" };
  }
}
