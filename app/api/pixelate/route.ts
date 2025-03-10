import { authorizeRequest } from '@/app/db/supabase/auth'
import { isAdmin } from '@/app/db/supabase/is-admin'
import { createClient } from '@/app/db/supabase/server'
import { generatePixelIcon } from '@/app/pixel-api/generate'
import { credits } from '@/app/utils/credits'
import { ERROR_CODES, ErrorResponse } from '@/lib/error'
import { generateId } from 'ai'
import { after, NextRequest, NextResponse } from 'next/server'
import { postProcessPixelate } from './post-process'

interface PixelateResponse {
  image: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PixelateResponse | ErrorResponse>> {
  try {
    const [authResult, formData, supabase] = await Promise.all([
      authorizeRequest(),
      request.formData(),
      createClient(),
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { error: ERROR_CODES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // if super admin, skip credits check
    if (!isAdmin(authResult.user.email)) {
      const hasCredits = await credits.decrement(authResult.user.id)
      if (!hasCredits) {
        return NextResponse.json(
          { error: ERROR_CODES.NO_CREDITS },
          { status: 400 }
        )
      }
    }

    const prompt = formData.get('prompt')

    if (typeof prompt !== 'string') {
      return NextResponse.json(
        { error: ERROR_CODES.INVALID_BODY },
        { status: 400 }
      )
    }

    const result = await generatePixelIcon({
      prompt: generatePrompt(prompt),
    })

    const base64Image = result.image.base64

    after(async () => {
      const buffer = Buffer.from(base64Image, 'base64')
      const postProcessedBuffer = await postProcessPixelate(buffer)
      const { data, error } = await supabase.storage
        .from('icons')
        .upload(generateId(), postProcessedBuffer, {
          contentType: 'image/png',
        })

      if (error) {
        // TODO: Implement retries:
        console.error('[POST /api/pixelate]: ', error)
        return
      }

      await supabase.from('pixel').insert({
        prompt,
        file_path: data.path,
      })
    })

    return NextResponse.json({ image: base64Image })
  } catch (error) {
    console.error('[POST /api/pixelate]: ', error)
    return NextResponse.json(
      { error: ERROR_CODES.UNEXPECTED_ERROR },
      { status: 500 }
    )
  }
}

// function decodeRgb(rgb: string) {
//   const rgbArray = rgb.split('/').map(Number)
//   return { rgb: rgbArray }
// }

// function decodeColors(colors: unknown) {
//   if (typeof colors !== 'string' || colors.length === 0) return []
//   return colors.split(',').map((c) => decodeRgb(c))
// }

function generatePrompt(prompt: string) {
  return `a PXCON, a 16-bit pixel art icon of ${prompt}. do NOT add a white background; the background should be TRANSPARENT.`
}
