import { after, NextRequest, NextResponse } from 'next/server'
// import { apiKey } from '@/lib/provider'
// import { apiUrlGenerate } from '@/lib/provider'
import { credits } from '@/app/utils/credits'
import { createClient } from '@/app/db/supabase/server'

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to generate an icon.' },
      { status: 401 }
    )
  }

  const [hasCredits, formData] = await Promise.all([
    credits.decrement(user.id),
    request.formData(),
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

  // const response = await fetch(apiUrlGenerate, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  //   method: 'POST',
  //   body: JSON.stringify({
  //     prompt: generatePrompt(prompt),
  //     style_id: 'color_v2',
  //     artistic_level: artisticLevel,
  //     controls: {
  //       colors,
  //     },
  //   }),
  // })

  // if (!response.ok) {
  //   const data = await response.json()
  //   console.error(data)
  //   return NextResponse.json(
  //     { error: 'Failed to generate icon.' },
  //     { status: 500 }
  //   )
  // }

  // const data = await response.json()

  // const isValidData = invariantCheck(data)

  // if (!isValidData) {
  //   console.error('Failed invariant check: ', data)
  //   return NextResponse.json(
  //     { error: 'Failed to generate icon.' },
  //     { status: 500 }
  //   )
  // }

  // const images = data.data

  // after(async () => {
  //   await Promise.all(
  //     images.map((image: { url: string }) =>
  //       // Save to postgres pixel table
  //       // Upload to icons storage bucket
  //       supabase.storage.from('icons').upload(image.url, image.url)
  //     )
  //   )
  // })

  return NextResponse.json({ images: [] })
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

function generatePrompt(prompt: string) {
  return `Create a pixelated icon of: ${prompt}. Do NOT add a white background; the background should be transparent.`
}
