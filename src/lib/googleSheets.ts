import { google } from 'googleapis'

// Google Sheets configuration
const SPREADSHEET_ID = '16B_qet1JSPOs0obGBHEenkpawNYfS4hf3xnqz1kH6TQ'
const SHEET_NAME = 'Sheet1' // Try common sheet names first
const RANGE = `${SHEET_NAME}!A:H` // Updated range for 8 columns (A through H)

// Configure Google Sheets API
// For public access, we'll use the API key method
// You'll need to set GOOGLE_SHEETS_API_KEY in your environment variables
const sheets = google.sheets({
  version: 'v4',
  auth: process.env.GOOGLE_SHEETS_API_KEY
})

export interface GoogleSheetsPrayerData {
  prayerRequestDate?: string
  content: string
  petitioner?: string
  isContactPetitioner?: string // Contact preference: "email", "phone", etc.
  petitionerContactPhone?: string
  petitionerContactEmail?: string
  petitionerContactEmail2?: string // Second email column
  hosannaLocation?: string
  isAnswered?: boolean
  isPrivate?: boolean
}

export async function fetchPrayersFromGoogleSheets(): Promise<GoogleSheetsPrayerData[]> {
  try {
    // First, let's try to get the sheet info to find the correct sheet name
    let finalRange = RANGE

    // Try different common sheet names
    const possibleSheetNames = ['Sheet1', 'Form Responses 1', 'Prayer Requests', 'Responses']

    let response
    let lastError

    for (const sheetName of possibleSheetNames) {
      try {
        const testRange = `${sheetName}!A:H`
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: testRange,
        })
        finalRange = testRange
        break
      } catch (error) {
        lastError = error
        continue
      }
    }

    if (!response) {
      throw lastError || new Error('Could not find a valid sheet')
    }

    const rows = response.data.values
    if (!rows || rows.length <= 1) {
      return []
    }

    // Skip header row and map data according to your actual column structure
    const prayers: GoogleSheetsPrayerData[] = rows.slice(1).map((row: any[]) => ({
      prayerRequestDate: row[0] || undefined, // Column A: Prayer Request Date
      content: row[1] || '', // Column B: Content
      petitioner: row[2] || undefined, // Column C: Petitioner
      isContactPetitioner: row[3] || undefined, // Column D: Contact Preference (email/phone string)
      petitionerContactPhone: row[4] || undefined, // Column E: Petitioner Contact Phone
      petitionerContactEmail: row[5] || undefined, // Column F: Petitioner Contact Email
      petitionerContactEmail2: row[6] || undefined, // Column G: Petitioner Contact Email (second)
      hosannaLocation: row[7] || undefined, // Column H: Hosanna Location
      isAnswered: false, // Default to unanswered for new imports
      isPrivate: false, // Default to not private for new imports
    }))

    // Filter out empty prayers and apply date filtering for last 2 months
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    return prayers.filter(prayer => {
      // Must have content
      if (!prayer.content.trim()) return false

      // If no date provided, include it (assume recent)
      if (!prayer.prayerRequestDate) return true

      // Parse and check if within last 2 months
      try {
        const prayerDate = new Date(prayer.prayerRequestDate)
        return prayerDate >= twoMonthsAgo
      } catch (error) {
        // If date parsing fails, include the prayer
        return true
      }
    })
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error)
    throw new Error('Failed to fetch prayers from Google Sheets')
  }
}

export async function getSheetInfo() {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    return {
      title: response.data.properties?.title,
      sheets: response.data.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
      }))
    }
  } catch (error) {
    console.error('Error getting sheet info:', error)
    // More specific error for debugging
    if (error.response?.status === 403) {
      throw new Error('Permission denied: Make sure the Google Sheet is shared publicly or "Anyone with the link can view"')
    } else if (error.response?.status === 404) {
      throw new Error('Google Sheet not found: Please check the spreadsheet ID')
    }
    throw new Error(`Failed to get sheet information: ${error.message}`)
  }
}