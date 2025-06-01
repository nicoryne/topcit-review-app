import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ensure dynamic execution to avoid caching issues with file reads if content changes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get the module ID from the search params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing module ID parameter' }, { status: 400 })
    }

    // Validate the ID - only allow known category IDs (e.g., 01-06)
    if (!/^0[1-6]$/.test(id)) {
      return NextResponse.json({ error: 'Invalid module ID. Must be in the format 01-06.' }, { status: 400 })
    }

    // Construct the absolute path to the JSON file
    const filePath = path.join(process.cwd(), 'public', 'quiz-data', `${id}.json`)

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Quiz data not found for ID: ${id}` }, { status: 404 })
    }

    // Read and parse the JSON file
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const quizData = JSON.parse(fileContents)

    // Return the quiz data
    return NextResponse.json(quizData)
  } catch (error: unknown) {
    console.error('Error serving quiz data:', error)
    return NextResponse.json({ error: 'Failed to load quiz data due to an internal server error.' }, { status: 500 })
  }
}
