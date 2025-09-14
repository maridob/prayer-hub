import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { fetchPrayersFromGoogleSheets, GoogleSheetsPrayerData } from "@/lib/googleSheets"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_SHEETS_API_KEY || process.env.GOOGLE_SHEETS_API_KEY === "your-google-sheets-api-key-here") {
      return NextResponse.json(
        { error: "Google Sheets API key not configured. Please add GOOGLE_SHEETS_API_KEY to your environment variables." },
        { status: 500 }
      )
    }

    // Fetch prayers from Google Sheets
    let googleSheetsPrayers: GoogleSheetsPrayerData[]
    try {
      googleSheetsPrayers = await fetchPrayersFromGoogleSheets()
    } catch (error) {
      console.error("Error fetching from Google Sheets:", error)
      return NextResponse.json(
        { error: "Failed to fetch prayers from Google Sheets. Please check the spreadsheet URL and API configuration." },
        { status: 500 }
      )
    }

    if (googleSheetsPrayers.length === 0) {
      return NextResponse.json({
        message: "No prayers found in Google Sheets",
        imported: 0,
        skipped: 0
      })
    }

    let imported = 0
    let skipped = 0

    // Get existing prayers to avoid duplicates (more efficient than checking one by one)
    const existingPrayers = await prisma.prayer.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        content: true,
        petitioner: true
      }
    })

    // Create a set of existing prayer signatures for fast lookup
    const existingPrayerSet = new Set(
      existingPrayers.map(p => `${p.content}|${p.petitioner || ''}`)
    )

    // Ensure user exists or create one
    const existingUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!existingUser) {
      // Create user if doesn't exist
      await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || 'user@example.com',
          name: session.user.name || 'User',
          password: 'placeholder' // This shouldn't be used since we're using session auth
        }
      });
    }

    // Process prayers in batches to avoid overwhelming the database
    const BATCH_SIZE = 10
    for (let i = 0; i < googleSheetsPrayers.length; i += BATCH_SIZE) {
      const batch = googleSheetsPrayers.slice(i, i + BATCH_SIZE)

      const createPromises = batch.map(async (sheetPrayer) => {
        try {
          // Check if prayer already exists using the set
          const prayerSignature = `${sheetPrayer.content}|${sheetPrayer.petitioner || ''}`
          if (existingPrayerSet.has(prayerSignature)) {
            skipped++
            return null
          }

          // Use the first available email (prefer the first column, fallback to second)
          const contactEmail = sheetPrayer.petitionerContactEmail || sheetPrayer.petitionerContactEmail2 || null;

          // Create new prayer
          const newPrayer = await prisma.prayer.create({
            data: {
              title: "Prayer Request", // Default title since your sheet doesn't have a title column
              content: sheetPrayer.content,
              petitioner: sheetPrayer.petitioner || null,
              petitionerContactEmail: contactEmail,
              petitionerContactPhone: sheetPrayer.petitionerContactPhone || null,
              hosannaLocation: sheetPrayer.hosannaLocation || null,
              isAnswered: sheetPrayer.isAnswered || false,
              isPrivate: sheetPrayer.isPrivate || false,
              isContactPetitioner: sheetPrayer.isContactPetitioner || null,
              userId: session.user.id,
              // Use prayer request date from sheet if available, otherwise use current time
              createdAt: sheetPrayer.prayerRequestDate ? new Date(sheetPrayer.prayerRequestDate) : new Date(),
            }
          })

          // Add to existing set to avoid duplicates within the same batch
          existingPrayerSet.add(prayerSignature)
          imported++
          return newPrayer
        } catch (error) {
          console.error("Error creating prayer:", error)
          skipped++
          return null
        }
      })

      // Wait for the current batch to complete before processing the next
      await Promise.allSettled(createPromises)
    }

    return NextResponse.json({
      message: `Successfully synced prayers from Google Sheets`,
      imported,
      skipped,
      total: googleSheetsPrayers.length
    })

  } catch (error) {
    console.error("Error syncing prayers:", error)
    return NextResponse.json(
      { error: "Internal server error during sync" },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if API key is configured
    const isConfigured = process.env.GOOGLE_SHEETS_API_KEY &&
                        process.env.GOOGLE_SHEETS_API_KEY !== "your-google-sheets-api-key-here"

    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        message: "Google Sheets API key not configured"
      })
    }

    // Try to get sheet info to verify connection
    try {
      const sheetsData = await fetchPrayersFromGoogleSheets()
      return NextResponse.json({
        configured: true,
        connected: true,
        availablePrayers: sheetsData.length,
        message: "Google Sheets connection is working"
      })
    } catch (error) {
      return NextResponse.json({
        configured: true,
        connected: false,
        error: "Cannot connect to Google Sheets. Please check the spreadsheet permissions and API key.",
        message: "Connection test failed"
      })
    }

  } catch (error) {
    console.error("Error checking sync status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}