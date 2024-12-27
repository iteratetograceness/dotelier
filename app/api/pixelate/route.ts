import { auth, db } from '@/app/db/client'
import { after, NextRequest, NextResponse } from 'next/server'
import { getRandomStyleId } from './style-id'
import { apiKey } from '@/lib/provider'
import { apiUrlGenerate } from '@/lib/provider'
import { getUserId } from '@/app/db'
import { credits } from '@/app/utils/credits'

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
  const session = auth.getSession()
  const isSignedIn = await session.isSignedIn()

  if (!isSignedIn) {
    return NextResponse.json(
      { error: 'You must be signed in to generate an icon.' },
      { status: 401 }
    )
  }

  const userId = await getUserId(session.client)

  if (!userId) {
    return NextResponse.json({ error: 'User not found.' }, { status: 401 })
  }

  const [hasCredits, formData, styleId] = await Promise.all([
    credits.decrement(userId),
    request.formData(),
    getRandomStyleId(),
  ])

  if (!hasCredits) {
    return NextResponse.json(
      { error: 'You have reached your daily limit.' },
      { status: 400 }
    )
  }

  const prompt = formData.get('prompt')

  if (typeof prompt !== 'string') {
    return NextResponse.json(
      { error: 'Invalid input. Please try again.' },
      { status: 400 }
    )
  }

  const encodedColors = formData.get('colors')
  const colors = decodeColors(encodedColors)
  const artisticLevel = formData.get('artistic_level') || 4

  const response = await fetch(apiUrlGenerate, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      prompt,
      style_id: styleId,
      model: 'recraft20b',
      artistic_level: artisticLevel,
      controls: {
        colors,
      },
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    console.error(data)
    return NextResponse.json(
      { error: 'Failed to generate icon.' },
      { status: 500 }
    )
  }

  const data = await response.json()

  const isValidData = invariantCheck(data)

  if (!isValidData) {
    console.error('Failed invariant check: ', data)
    return NextResponse.json(
      { error: 'Failed to generate icon.' },
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

function decodeColors(colors: unknown) {
  if (typeof colors !== 'string' || colors.length === 0) return []
  return colors.split(',').map((c) => decodeRgb(c))
}

function invariantCheck(data: unknown): data is { data: { url: string }[] } {
  if (
    !data ||
    typeof data !== 'object' ||
    !('data' in data) ||
    !Array.isArray(data.data)
  ) {
    return false
  }

  return true
}
