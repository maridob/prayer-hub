import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // "answered", "unanswered", "all"
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const teamMember = searchParams.get("teamMember")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    }

    // Filter by prayer status
    if (status === "answered") {
      where.isAnswered = true
    } else if (status === "unanswered") {
      where.isAnswered = false
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Filter by team member (petitioner name)
    if (teamMember && teamMember.trim() !== "") {
      where.petitioner = {
        contains: teamMember,
        mode: "insensitive"
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination info
    const totalCount = await prisma.prayer.count({ where })

    // Get paginated prayers
    const prayers = await prisma.prayer.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      prayers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })
  } catch (error) {
    console.error("Error fetching prayers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}