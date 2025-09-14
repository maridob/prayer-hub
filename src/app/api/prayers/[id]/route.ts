import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const prayer = await prisma.prayer.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!prayer) {
      return NextResponse.json(
        { error: "Prayer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(prayer)
  } catch (error) {
    console.error("Error fetching prayer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isAnswered, isPrivate, title, content } = body

    // Verify the prayer belongs to the user
    const existingPrayer = await prisma.prayer.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingPrayer) {
      return NextResponse.json(
        { error: "Prayer not found" },
        { status: 404 }
      )
    }

    // Update the prayer
    const updatedPrayer = await prisma.prayer.update({
      where: {
        id
      },
      data: {
        ...(isAnswered !== undefined && { isAnswered }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedPrayer)
  } catch (error) {
    console.error("Error updating prayer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}