'use server'

import { authorizeRequest } from '@/lib/auth/request'
import { createPixel, startPostProcessing } from '@/lib/db/queries'
import { ERROR_CODES, ErrorCode } from '@/lib/error'
import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { postProcessPixelIcon } from './post-process'
import { PixelApiResponse, PixelApiResponseSchema } from './types'

export async function generatePixelIcon({
  prompt,
  id,
}: {
  prompt: string
  id?: string
}): Promise<
  | {
      result: PixelApiResponse
      id: string
      success: true
    }
  | {
      error: ErrorCode
      id?: string
      success: false
    }
> {
  // let bypassCredits = false
  let userId: string
  const pixelId = id ?? uuidv4()

  try {
    const [authResult, headersList] = await Promise.all([
      authorizeRequest({ withJwt: true }),
      headers(),
    ])

    if (!authResult.success) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    const dbPromise = createPixel({
      userId: authResult.user.id,
      prompt,
      pixelId,
    })

    const { jwt } = authResult

    if (!jwt) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    userId = authResult.user.id
    // bypassCredits = Boolean(authResult.user.role === 'admin')

    // if (!bypassCredits) {
    //   const hasCredits = await credits.decrement(userId)
    //   if (!hasCredits) {
    //     return { error: ERROR_CODES.NO_CREDITS, success: false }
    //   }
    // }

    const maybePixelId = await dbPromise

    if (!maybePixelId) {
      throw new Error('Failed to save pixel')
    }

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

    const postProcessingPromise = postProcessPixelIcon({
      pixelId,
      fileKey: parsedData.data.images[0].fileKey,
    })

    const startPostProcessingPromise = startPostProcessing({
      pixelId,
      fileKey: parsedData.data.images[0].fileKey,
    })

    after(async () =>
      startPostProcessingPromise.then(async () => {
        await postProcessingPromise
      })
    )

    revalidateTag(`getLatestPixelIds:${userId}`)
    revalidateTag(`pixel:${id}`)

    return {
      result: parsedData.data,
      id: pixelId,
      success: true,
    }
  } catch (error) {
    console.error('[generatePixelIcon]: ', error)
    // after(async () => {
    //   if (!bypassCredits && userId) {
    //     await credits.increment(userId)
    //   }
    // })
    return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
  }
}
