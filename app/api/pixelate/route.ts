import { NextRequest, NextResponse } from 'next/server'

const STYLE_ID = process.env.STYLE_ID
const API_KEY = process.env.API_KEY
const API_URL = 'https://external.api.recraft.ai/v1/images/generations'

if (!STYLE_ID || !API_KEY) {
  throw new Error('Missing STYLE_ID and API_KEY must be set')
}

interface PixelateResponse {
  images: {
    url: string
  }[]
}

interface ErrorResponse {
  error: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PixelateResponse | ErrorResponse>> {
  const formData = await request.formData()
  const prompt = formData.get('prompt')

  if (typeof prompt !== 'string') {
    return NextResponse.json(
      { error: 'Invalid input. Please try again.' },
      { status: 400 }
    )
  }

  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      prompt,
      style_id: STYLE_ID,
      model: 'recraft20b',
    }),
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to generate icon. Please try again.' },
      { status: 500 }
    )
  }

  const data = await response.json()

  if (!data || typeof data !== 'object' || !Array.isArray(data.data)) {
    return NextResponse.json(
      { error: 'Unexpected error while generating icon. Please try again.' },
      { status: 500 }
    )
  }

  const images = data.data

  return NextResponse.json({ images })
}
