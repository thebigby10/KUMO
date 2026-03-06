"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubmissionController } from "@/controller/SubmissionController";

// 1. Ensure Submissions Exist (Initialize Work)
export async function initializeWorkSession(workId: string) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  try {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: { tasks: { include: { editors: true } } },
    });

    if (!work) return { error: "Work not found" };

    // Check Start Time
    if (work.startTime && new Date() < new Date(work.startTime)) {
      return { error: "This assignment has not started yet." };
    }

    // Check End Time (Optional: allow viewing if ended, but logic elsewhere handles submission)
    const isOver = work.endTime && new Date() > new Date(work.endTime);

    // Create Draft Submissions for all tasks if they don't exist
    for (const task of work.tasks) {
      const existing = await prisma.submission.findUnique({
        where: {
          taskId_userEmail: { taskId: task.id, userEmail: user.email },
        },
      });

      if (!existing && !isOver) {
        await prisma.submission.create({
          data: {
            workId: work.id,
            taskId: task.id,
            userEmail: user.email,
            code: task.editors[0]?.solution || "", // Starter code
            status: "DRAFT",
            language: "python",
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Init Session Error:", error);
    return { error: "Failed to initialize session" };
  }
}

// 2. Auto Save Code
export async function autoSaveCode(taskId: string, code: string) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  try {
    await prisma.submission.update({
      where: {
        taskId_userEmail: { taskId, userEmail: user.email },
      },
      data: {
        code,
        lastSavedAt: new Date(),
      },
    });
    return { success: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return { error: "Save failed" };
  }
}

// 3. Log Violation
export async function logViolationAction(taskId: string, description: string) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  try {
    const submission = await prisma.submission.findUnique({
      where: { taskId_userEmail: { taskId, userEmail: user.email } },
    });

    if (!submission) return;

    // Parse existing logs
    const currentLogs = submission.violationLogs
      ? JSON.parse(submission.violationLogs)
      : [];

    const newLog = {
      time: new Date().toISOString(),
      description,
    };

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        violationCount: { increment: 1 },
        violationLogs: JSON.stringify([...currentLogs, newLog]),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Violation Log Error:", error);
    return { error: "Logging failed" };
  }
}

// Existing submitTaskAction...
// We modify it slightly to handle forced auto-submit
export async function submitTaskAction(
  workId: string,
  taskId: string,
  code: string,
  language: string,
  forceSubmit = false,
) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  try {
    const submission = await prisma.submission.findUnique({
      where: { taskId_userEmail: { taskId, userEmail: user.email } },
    });

    if (!submission) return { error: "No record" };

    await prisma.submission.update({
      where: { id: submission.id },
      data: { code, language, status: "SUBMITTED", submittedAt: new Date() },
    });

    // Run test cases against the submitted code
    const testResults = await SubmissionController.runTestCases(
      taskId,
      code,
      language,
    );

    revalidatePath(`/work/${workId}`);
    return { success: true, testResults };
  } catch (e) {
    return { error: "Submit failed" };
  }
}

// Run tests without submitting (student can test before final submission)
export async function runTestsAction(
  taskId: string,
  code: string,
  language: string,
) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  try {
    const testResults = await SubmissionController.runTestCases(
      taskId,
      code,
      language,
    );

    if (testResults.length === 0) {
      return { success: true, testResults: [], message: "No test cases defined." };
    }

    return { success: true, testResults };
  } catch (e) {
    return { error: "Test execution failed" };
  }
}

// 4. Evaluate using AI Detection Service
export async function evaluateAISubmissionAction(code: string, language: string) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  const AI_DETECT_URL = process.env.AI_DETECT_URL || "http://localhost:8004/detect";

  try {
    const res = await fetch(AI_DETECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.detail || "AI Detection service failed to respond." };
    }

    const data = await res.json();
    return { success: true, result: data };
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return { error: "Failed to connect to AI Detection service." };
  }
}
