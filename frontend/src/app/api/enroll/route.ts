// app/api/enrollments/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all enrollments with optional filters
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const labId = searchParams.get("labId");
    const userEmail = searchParams.get("userEmail");
    const includeArchived = searchParams.get("includeArchived") === "true";
    
    // Build where clause with proper TypeScript types
    const whereClause: {
      labId?: string;
      userEmail?: string;
      lab?: {
        isArchived: boolean;
      };
    } = {};

    if (labId) {
      whereClause.labId = labId;
      
      // If filtering by lab, we can also filter archived status
      if (!includeArchived) {
        whereClause.lab = {
          isArchived: false
        };
      }
    }

    if (userEmail) {
      whereClause.userEmail = userEmail;
    }

    // If no specific lab/user filter and archived labs should be excluded
    if (!labId && !userEmail && !includeArchived) {
      whereClause.lab = {
        isArchived: false
      };
    }

    // Get all enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
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
            section: true,
            isArchived: true
          }
        }
      },
      orderBy: {
        joinedAt: "desc"
      }
    });

    return NextResponse.json(enrollments, { status: 200 });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
};

// CREATE a new enrollment
export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json();
    const { userEmail, labId } = data;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    if (!labId) {
      return NextResponse.json(
        { error: "Lab ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const lab = await prisma.lab.findUnique({
      where: { id: labId }
    });

    if (!lab) {
      return NextResponse.json(
        { error: "Lab not found" },
        { status: 404 }
      );
    }

    if (lab.isArchived) {
      return NextResponse.json(
        { error: "Cannot enroll in archived lab" },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userEmail,
        labId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "User is already enrolled in this lab" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userEmail,
        labId,
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
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
};




// Alternative DELETE method using request body
export const DELETE = async (request: NextRequest) => {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id }
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Enrollment deleted successfully",
        deletedId: id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          { error: "Cannot delete enrollment due to existing dependencies" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
};