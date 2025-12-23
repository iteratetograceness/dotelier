'use server'

import { authorizeRequest } from '@/lib/auth/request'
import { createPixel, deletePixel, startPostProcessing } from '@/lib/db/queries'
import { ERROR_CODES, ErrorCode } from '@/lib/error'
import { generateRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { credits } from '../utils/credits'
import { generateWithGemini } from './generate-gemini'
import { postProcessPixelIcon } from './post-process'
import { ModelType, PixelApiResponse, PixelApiResponseSchema } from './types'

export async function generatePixelIcon({
  prompt,
  id,
  model = 'flux',
}: {
  prompt: string
  id?: string
  model?: ModelType
}): Promise<
  | {
      result: PixelApiResponse
      id: string
      noBgPngUrl: string
      noBgFileKey: string
      success: true
    }
  | {
      error: ErrorCode
      id?: string
      success: false
    }
> {
  let bypassCredits = false
  let userId: string
  let pixelCreated = false
  const pixelId = id ?? uuidv4()

  try {
    const [authResult, headersList] = await Promise.all([
      authorizeRequest({ withJwt: true }),
      headers(),
    ])

    // Rate limit by fingerprint/IP before processing
    const identifier = getRateLimitIdentifier(headersList)
    const { success: rateLimitSuccess } = await generateRateLimit.limit(identifier)
    if (!rateLimitSuccess) {
      return { error: ERROR_CODES.RATE_LIMITED, success: false }
    }

    if (!authResult.success) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    const { jwt } = authResult

    if (!jwt) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    userId = authResult.user.id
    bypassCredits = Boolean(authResult.user.role === 'admin')

    if (!bypassCredits) {
      const hasCredits = await credits.decrement(userId)
      if (!hasCredits) {
        return { error: ERROR_CODES.NO_CREDITS, success: false }
      }
    }

    const maybePixelId = await createPixel({
      userId: authResult.user.id,
      prompt,
      pixelId,
    })

    if (!maybePixelId) {
      throw new Error('Failed to save pixel')
    }

    pixelCreated = true

    let generatedData: PixelApiResponse

    // 90 second timeout for image generation
    const GENERATION_TIMEOUT_MS = 90_000

    if (model === 'gemini') {
      // Generate with Gemini using reference images
      generatedData = await generateWithGemini({ prompt, pixelId })
    } else {
      // Generate with FLUX via Modal
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS)

      try {
        const response = await fetch(process.env.PIXEL_API_ENDPOINT!, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Auth-JWT': jwt,
            Origin: headersList.get('Origin') ?? 'https://dotelier.studio',
          },
          body: JSON.stringify({
            prompt,
            pixel_id: pixelId,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(error)
        }

        const data = await response.json()
        const parsedData = PixelApiResponseSchema.safeParse(data)

        if (!parsedData.success) {
          console.error('[generatePixelIcon] Invalid response: ', data)
          throw new Error('Invalid response')
        }

        generatedData = parsedData.data
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Image generation timed out')
        }
        throw error
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // Start post-processing record in DB
    await startPostProcessing({
      pixelId,
      fileKey: generatedData.images[0].fileKey,
    })

    // Run background removal and wait for result (need URL for client-side vectorization)
    const postProcessResult = await postProcessPixelIcon({
      pixelId,
      fileKey: generatedData.images[0].fileKey,
    })

    if (!postProcessResult.success) {
      throw new Error(postProcessResult.error)
    }

    revalidateTag(`getLatestPixelIds:${userId}`, { expire: 0 })
    revalidateTag(`pixel:${id}`, { expire: 0 })

    return {
      result: generatedData,
      id: pixelId,
      noBgPngUrl: postProcessResult.noBgPngUrl,
      noBgFileKey: postProcessResult.noBgFileKey,
      success: true,
    }
  } catch (error) {
    console.error('[generatePixelIcon]: ', error)
    after(async () => {
      await Promise.all([
        !bypassCredits && userId ? credits.increment(userId) : null,
        pixelCreated ? deletePixel(pixelId) : null,
      ])
    })
    return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
  }
}
