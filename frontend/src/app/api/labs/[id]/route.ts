import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation Schemas
const paramsSchema = z.object({
  id: z.string().uuid()
})

const labUpdateSchema = z.object({
  name: z.string().optional(),
  labCode: z.string().optional(),
  section: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isArchived: z.boolean().optional()
})

// GET /api/labs/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await context.params)

    const lab = await prisma.lab.findUnique({
      where: { id }
    })

    if (!lab) {
      return NextResponse.json(
        { success: false, error: 'Lab not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lab
    })
  } catch (error) {
    console.error('GET Lab Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lab' },
      { status: 500 }
    )
  }
}

// PUT /api/labs/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await context.params)
    const body = labUpdateSchema.parse(await request.json())

    const existingLab = await prisma.lab.findUnique({
      where: { id }
    })

    if (!existingLab) {
      return NextResponse.json(
        { success: false, error: 'Lab not found' },
        { status: 404 }
      )
    }

    // Ensure labCode uniqueness
    if (body.labCode && body.labCode !== existingLab.labCode) {
      const codeExists = await prisma.lab.findUnique({
        where: { labCode: body.labCode }
      })

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Lab code already exists' },
          { status: 409 }
        )
      }
    }

    const updatedLab = await prisma.lab.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      message: 'Lab updated successfully',
      data: updatedLab
    })
  } catch (error) {
    console.error('PUT Lab Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lab' },
      { status: 500 }
    )
  }
}

// PATCH /api/labs/[id]
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await context.params)
    const body = labUpdateSchema.partial().parse(await request.json())

    const existingLab = await prisma.lab.findUnique({
      where: { id }
    })

    if (!existingLab) {
      return NextResponse.json(
        { success: false, error: 'Lab not found' },
        { status: 404 }
      )
    }

    if (body.labCode && body.labCode !== existingLab.labCode) {
      const codeExists = await prisma.lab.findUnique({
        where: { labCode: body.labCode }
      })

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Lab code already exists' },
          { status: 409 }
        )
      }
    }

    const updatedLab = await prisma.lab.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      message: 'Lab partially updated',
      data: updatedLab
    })
  } catch (error) {
    console.error('PATCH Lab Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to partially update lab' },
      { status: 500 }
    )
  }
}

// DELETE /api/labs/[id]  → SOFT DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await context.params)

    const lab = await prisma.lab.findUnique({ where: { id } })
    if (!lab) {
      return NextResponse.json(
        { success: false, error: 'Lab not found' },
        { status: 404 }
      )
    }

    if (lab.isArchived) {
      return NextResponse.json(
        { success: false, error: 'Lab already archived' },
        { status: 409 }
      )
    }

    await prisma.lab.update({
      where: { id },
      data: { isArchived: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Lab archived successfully'
    })
  } catch (error) {
    console.error('ARCHIVE Lab Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to archive lab' },
      { status: 500 }
    )
  }
}

