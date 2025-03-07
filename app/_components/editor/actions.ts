'use server'

import { z } from 'zod'
import { replicate } from '@/lib/replicate'
import { createClient } from '@/app/db/supabase/server'
import { ERROR_CODES, ErrorResponse } from '@/lib/error'
import { cookies as getCookies } from 'next/headers'
import { VECTORIZE_API } from '@/lib/constants'
import { authorizeRequest } from '@/app/db/supabase/auth'
import { revalidatePath } from 'next/cache'

const ReplicateResponseSchema = z.object({
  url: z.function().returns(z.instanceof(URL)),
})

export async function removeBackground(
  imageUrl: string
): Promise<ErrorResponse | { url: string }> {
  if (!process.env.BG_REMOVER_MODEL) {
    console.error('[removeBackground]: BG_REMOVER_MODEL is not set')
    return { error: ERROR_CODES.FAILED_TO_EDIT_ICON }
  }

  const identifier = process.env.BG_REMOVER_MODEL as `${string}/${string}`

  try {
    const output = await replicate.run(identifier, {
      input: { image: imageUrl },
    })

    const parsedOutput = ReplicateResponseSchema.safeParse(output)

    if (!parsedOutput.success) {
      console.error('[removeBackground]: ', parsedOutput.error)
      return { error: ERROR_CODES.FAILED_TO_EDIT_ICON }
    }

    return { url: parsedOutput.data.url().href }
  } catch (error) {
    console.error('[removeBackground]: ', error)
    return { error: ERROR_CODES.FAILED_TO_EDIT_ICON }
  }
}

export async function saveImageToDb({
  id,
  originalPath,
  imageUrl,
}: {
  id: number
  originalPath: string
  imageUrl: string
}): Promise<
  | {
      data: {
        id: string
        path: string
        fullPath: string
      }
    }
  | ErrorResponse
> {
  const [authResult, response, supabase] = await Promise.all([
    authorizeRequest(),
    fetch(imageUrl),
    createClient(),
  ])

  if (!authResult.success) {
    console.error('[saveImageToDb] Failed to authorize request')
    return { error: ERROR_CODES.UNAUTHORIZED }
  }

  if (!response.ok) {
    console.error('[saveImageToDb] Failed to fetch image from URL')
    return { error: ERROR_CODES.FAILED_TO_SAVE_ICON }
  }

  const blob = await response.blob()

  const { data, error } = await supabase.storage
    .from('icons')
    .update(originalPath, blob)

  if (error) {
    console.error('[saveImageToDb] Error updating image', error)
    return { error: ERROR_CODES.FAILED_TO_SAVE_ICON }
  }

  revalidatePath('/atelier')
  revalidatePath('/explore')
  revalidatePath(`/edit/${id}`)

  return { data }
}

const VectorizeSchema = z.object({
  url: z.string(),
})
export async function vectorizeImage(imageUrl: string) {
  try {
    const [imageResponse, cookies] = await Promise.all([
      fetch(imageUrl),
      getCookies(),
    ])
    const imageBlob = await imageResponse.blob()
    const isPng = imageBlob.type === 'image/png'

    if (!isPng) {
      console.error('[vectorizeImage] Image must be a PNG')
      return { error: ERROR_CODES.IMAGE_NOT_PNG }
    }

    const fileName = imageUrl.split('/').pop() || 'dotelier-icon.png'
    const file = new File([imageBlob], fileName, {
      type: 'image/png',
    })
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(VECTORIZE_API, {
      method: 'POST',
      body: formData,
      headers: {
        cookie: cookies.toString(),
      },
    })

    if (!response.ok) {
      return { error: ERROR_CODES.VECTORIZATION_ERROR }
    }

    const data = await response.json()
    const parsedData = VectorizeSchema.safeParse(data)

    if (!parsedData.success) {
      console.error('[vectorizeImage]: ', parsedData.error)
      return { error: ERROR_CODES.VECTORIZATION_ERROR }
    }

    return parsedData.data
  } catch (error) {
    console.error('[vectorizeImage]: ', error)
    return { error: ERROR_CODES.UNEXPECTED_ERROR }
  }
}
