// app/api/enrollments/lab-code/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Enroll a user using lab code
export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json();
    const { userEmail, labCode } = data;

    // Validate required fields
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    if (!labCode) {
      return NextResponse.json(
        { error: "Lab code is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find lab by code
    const lab = await prisma.lab.findUnique({
      where: { labCode }
    });

    if (!lab) {
      return NextResponse.json(
        { error: "Lab not found with this code" },
        { status: 404 }
      );
    }

    // Check if lab is archived
    if (lab.isArchived) {
      return NextResponse.json(
        { error: "Cannot enroll in archived lab" },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userEmail,
        labId: lab.id
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "User is already enrolled in this lab" },
        { status: 400 }
      );
    }

    // Check if user is an instructor in this lab (instructors shouldn't enroll as students)
    const isInstructor = await prisma.instructor.findFirst({
      where: {
        userEmail,
        labId: lab.id
      }
    });

    if (isInstructor) {
      return NextResponse.json(
        { error: "Instructors cannot enroll as students in their own lab" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userEmail,
        labId: lab.id,
        joinedAt: new Date()
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            avatar: true
          }
        },
        lab: {
          select: {
            id: true,
            name: true,
            labCode: true,
            subject: true,
            section: true
          }
        }
      }
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment with lab code:", error);
    return NextResponse.json(
      { error: "Failed to enroll using lab code" },
      { status: 500 }
    );
  }
};