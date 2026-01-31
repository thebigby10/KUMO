"use server";

import { SubmissionRepository } from "@/repositories/SubmissionRepository";
import { InstructorRepository } from "@/repositories/InstructorRepository";
import { EnrollmentRepository } from "@/repositories/EnrollmentRepository";
import { getCurrentUser } from "./auth";
import { db } from "@/lib/prisma";

export async function getStudentDashboardData(labId: string, studentEmail: string) {
  const user = await getCurrentUser();
  if (!user?.email) return { error: "Unauthorized" };

  const instructor = await InstructorRepository.findByUserAndLab(user.email, labId);
  if (!instructor) return { error: "Only instructors can view student dashboards" };

  const enrollment = await EnrollmentRepository.findByUserAndLab(studentEmail, labId);
  if (!enrollment) return { error: "Student is not enrolled in this lab" };

  const student = await db.user.findUnique({
    where: { email: studentEmail },
    select: {
      email: true,
      name: true,
      avatar: true,
    },
  });

  if (!student) return { error: "Student not found" };

  const submissions = await SubmissionRepository.findAllByStudentAndLab(studentEmail, labId);
  const stats = await SubmissionRepository.getStudentLabStats(studentEmail, labId);

  const workMap = new Map<
    string,
    {
      id: string;
      title: string;
      totalPoints: number;
      startTime: Date | null;
      endTime: Date | null;
      tasks: Array<{
        id: string;
        title: string;
        point: number;
        submissionId: string;
        status: string;
        grade: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        code: string;
        language: string;
      }>;
    }
  >();

  submissions.forEach((sub) => {
    if (!workMap.has(sub.work.id)) {
      workMap.set(sub.work.id, {
        id: sub.work.id,
        title: sub.work.title,
        totalPoints: sub.work.totalPoints,
        startTime: sub.work.startTime,
        endTime: sub.work.endTime,
        tasks: [],
      });
    }
    workMap.get(sub.work.id)!.tasks.push({
      id: sub.task.id,
      title: sub.task.title,
      point: sub.task.point,
      submissionId: sub.id,
      status: sub.status,
      grade: sub.grade,
      feedback: sub.feedback,
      submittedAt: sub.submittedAt,
      code: sub.code,
      language: sub.language,
    });
  });

  return {
    student,
    stats,
    works: Array.from(workMap.values()),
    joinedAt: enrollment.joinedAt,
  };
}
