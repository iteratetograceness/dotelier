import { authorizeRequest } from '@/app/db/supabase/auth'
import { ERROR_CODES, ErrorResponse } from '@/lib/error'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RecraftOutputSchema = z.object({
  created: z.number(),
  credits: z.number(),
  image: z.object({
    image_id: z.string(),
    url: z.string(),
  }),
})

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ url: string } | ErrorResponse>> {
  try {
    const authResult = await authorizeRequest()

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) {
      return NextResponse.json(
        { error: ERROR_CODES.INVALID_BODY },
        { status: 400 }
      )
    }

    const response = await fetch(
      'https://external.api.recraft.ai/v1/images/vectorize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RECRAFT_API_KEY}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('[POST /api/vectorize]: ', text)
      return NextResponse.json(
        { error: ERROR_CODES.VECTORIZATION_ERROR },
        { status: response.status }
      )
    }

    const data = await response.json()
    const result = RecraftOutputSchema.safeParse(data)

    if (!result.success) {
      console.error('[POST /api/vectorize]: ', result.error)
      return NextResponse.json(
        { error: ERROR_CODES.INVALID_SCHEMA },
        { status: 500 }
      )
    }

    const imageUrl = result.data.image.url

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error('[POST /api/vectorize]: ', error)
    return NextResponse.json(
      { error: ERROR_CODES.UNEXPECTED_ERROR },
      { status: 500 }
    )
  }
}
