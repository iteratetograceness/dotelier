'server only'

import { updatePostProcessingStatus } from '@/lib/db/queries'
import { replicate } from '@/lib/replicate'
import { getPublicPixelAsset, uploadApi } from '@/lib/ut'
import { after } from 'next/server'
import { z } from 'zod'

async function removeBackground(fileKey: string) {
  try {
    const filePath = getPublicPixelAsset(fileKey)

    const input = {
      image: filePath,
    }

    const model = process.env.BG_REMOVER_MODEL

    if (!model) {
      throw new Error('BG_REMOVER_MODEL is not set')
    }

    const output = await replicate.run(
      model as `${string}/${string}:${string}`,
      {
        input,
      }
    )

    const response = new Response(output as unknown as BodyInit)
    const arrayBuffer = await response.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: 'image/png' })

    return { blob }
  } catch (error) {
    console.error('[removeBackground] Error: ', error)
    return {
      blob: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

const RecraftResponseSchema = z.object({
  image: z.object({
    b64_json: z.string(),
  }),
})

async function convertToSvg(blob: Blob) {
  const formData = new FormData()
  formData.append('file', blob, 'image.png')
  formData.append('response_format', 'b64_json')

  const response = await fetch(
    'https://external.api.recraft.ai/v1/images/vectorize',
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${process.env.RECRAFT_API_KEY}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    return {
      blob: null,
      error,
    }
  }

  const data = await response.json()

  const parsedData = RecraftResponseSchema.safeParse(data)

  if (!parsedData.success) {
    return {
      blob: null,
      error: parsedData.error.message,
    }
  }

  const svgString = atob(parsedData.data.image.b64_json)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })

  return { blob: svgBlob }
}

export async function postProcessPixelIcon({
  pixelId,
  fileKey,
}: {
  pixelId: string
  fileKey: string
}) {
  try {
    const [removedBackground] = await Promise.all([
      removeBackground(fileKey),
      updatePostProcessingStatus({
        pixelId,
        status: 'background_removal',
      }),
    ])

    if (!removedBackground.blob) {
      after(async () => {
        await updatePostProcessingStatus({
          pixelId,
          status: 'background_removal_failed',
          completedAt: new Date(),
          errorMessage: removedBackground.error,
        })
      })
      throw new Error('Failed to remove background')
    }

    const removedBackgroundFile = new File(
      [removedBackground.blob],
      `${pixelId}_nobg.png`,
      {
        type: 'image/png',
      }
    )

    const [vectorized, noBgUpload] = await Promise.all([
      convertToSvg(removedBackground.blob),
      uploadApi.uploadFiles([removedBackgroundFile]),
      updatePostProcessingStatus({
        pixelId,
        status: 'convert_to_svg',
      }),
    ])

    if (!noBgUpload.length || noBgUpload[0].error) {
      console.error(
        '[postProcessPixelIcon] Failed to upload no-background PNG: ',
        noBgUpload[0].error
      )
    }

    if (!vectorized.blob) {
      after(async () => {
        await updatePostProcessingStatus({
          pixelId,
          status: 'convert_to_svg_failed',
          completedAt: new Date(),
          errorMessage: vectorized.error,
        })
      })
      throw new Error('Failed to convert to SVG')
    }

    const svgFile = new File([vectorized.blob], `${pixelId}.svg`, {
      type: 'image/svg+xml',
    })

    after(async () => {
      await Promise.all([
        updatePostProcessingStatus({
          pixelId,
          status: 'completed',
          completedAt: new Date(),
        }),
        uploadApi.uploadFiles([svgFile]),
      ])
    })

    return { success: true }
  } catch (error) {
    console.error('[postProcessPixelIcon] Error: ', error)
    return { success: false }
  }
}
