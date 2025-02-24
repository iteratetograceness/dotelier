'use server'

import { z } from 'zod'
import { cookies as getCookies } from 'next/headers'
import { authorizeRequest } from '../db/supabase/auth'
import { PIXELATE_API } from '@/lib/constants'
import { ERROR_CODES, ErrorCode } from '@/lib/error'

export interface FormState {
  image?: string
  error?: ErrorCode
}

const PixelateSuccessSchema = z.object({
  image: z.string(),
})

export async function generateIcon(
  _previousState: FormState,
  formData: FormData
) {
  const [authResult, cookies] = await Promise.all([
    authorizeRequest(),
    getCookies(),
  ])

  if (!authResult.success) {
    return {
      error: ERROR_CODES.UNAUTHORIZED,
    }
  }

  if (!formData.get('prompt')) {
    return {
      error: ERROR_CODES.MISSING_PROMPT,
    }
  }

  const response = await fetch(PIXELATE_API, {
    method: 'POST',
    body: formData,
    headers: {
      cookie: cookies.toString(),
    },
  })

  if (!response.ok) {
    return {
      error: ERROR_CODES.FAILED_TO_GENERATE_ICON,
    }
  }

  const data = await response.json()

  const parsedData = PixelateSuccessSchema.safeParse(data)

  if (!parsedData.success) {
    console.error('[generateIcon]: ', parsedData.error)
    return {
      error: ERROR_CODES.FAILED_TO_GENERATE_ICON,
    }
  }

  return {
    image: parsedData.data.image,
  }
}
