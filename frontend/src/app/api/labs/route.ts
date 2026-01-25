import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all labs (with archived filter)
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived");

    const whereClause: { isArchived?: boolean } = {};

    if (archived === "true") {
      whereClause.isArchived = true;
    } else if (archived === "false" || archived === null) {
      // default behavior
      whereClause.isArchived = false;
    }
    // archived=all → no filter applied

    const labs = await prisma.lab.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(labs, { status: 200 });
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json(
      { error: "Failed to fetch labs" },
      { status: 500 }
    );
  }
};

// CREATE a new lab
export const POST = async (request: NextRequest) => {
  try {
    const data = await request.json();
    const { name, userEmail } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const labCode = await generateUniqueLabCode();

    const lab = await prisma.lab.create({
      data: {
        name,
        labCode,
        banner: data.banner || null,
        description: data.description || null,
        section: data.section || null,
        subject: data.subject || null,
        room: data.room || null,
        isArchived: false,
        instructors: {
          create: {
            userEmail,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(lab, { status: 201 });
  } catch (error) {
    console.error("Error creating lab:", error);
    return NextResponse.json(
      { error: "Failed to create lab" },
      { status: 500 }
    );
  }
};

// Generate a unique lab code
async function generateUniqueLabCode(
  length = 6,
  maxAttempts = 10
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const labCode = generateLabCode(length);

    const existingLab = await prisma.lab.findUnique({
      where: { labCode },
    });

    if (!existingLab) {
      return labCode;
    }

    attempts++;

    if (attempts >= maxAttempts / 2) {
      length++;
    }
  }

  throw new Error("Failed to generate unique lab code after multiple attempts");
}

// Helper function
function generateLabCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
