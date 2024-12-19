import { db } from '@/app/db/client'
import { after, NextRequest, NextResponse } from 'next/server'

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

  const encodedColors = formData.get('colors')

  const colors =
    typeof encodedColors === 'string' ? decodeColors(encodedColors) : []

  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      prompt: `${prompt}`,
      style_id: STYLE_ID,
      model: 'recraft20b',
      controls: {
        colors,
      },
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    console.error(data)
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

  after(async () => {
    await Promise.all(
      images.map((image: { url: string }) =>
        db.execute(
          `INSERT Pixel {
          prompt := "${prompt}",
          url := "${image.url}",
          created_at := datetime_current(),
        }`
        )
      )
    )
  })

  return NextResponse.json({ images })
}

function decodeRgb(rgb: string) {
  const rgbArray = rgb.split('/').map(Number)
  return { rgb: rgbArray }
}

function decodeColors(colors: string) {
  return colors.split(',').map((c) => decodeRgb(c))
}
