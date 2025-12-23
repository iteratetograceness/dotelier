'server only'

import {
  insertPixelVersion,
  updatePostProcessingStatus,
} from '@/lib/db/queries'
import { DEFAULT_GRID_SETTINGS } from '@/lib/grid-settings'
import { PostProcessingStatus } from '@/lib/constants'
import { replicate } from '@/lib/replicate'
import { getPublicPixelAsset } from '@/lib/ut/client'
import { uploadApi } from '@/lib/ut/server'
import { after } from 'next/server'

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

/**
 * Removes background from a pixel icon and uploads the result.
 * Returns the URL of the no-background PNG for client-side vectorization.
 */
export async function postProcessPixelIcon({
  pixelId,
  fileKey,
}: {
  pixelId: string
  fileKey: string
}): Promise<
  | { success: true; noBgPngUrl: string; noBgFileKey: string }
  | { success: false; error: string }
> {
  try {
    const [removedBackground] = await Promise.all([
      removeBackground(fileKey),
      updatePostProcessingStatus({
        pixelId,
        status: PostProcessingStatus.BACKGROUND_REMOVAL,
      }),
    ])

    if (!removedBackground.blob) {
      after(async () => {
        await updatePostProcessingStatus({
          pixelId,
          status: PostProcessingStatus.BACKGROUND_REMOVAL_FAILED,
          completedAt: new Date(),
          errorMessage: removedBackground.error,
        })
      })
      return {
        success: false,
        error: removedBackground.error ?? 'Failed to remove background',
      }
    }

    const removedBackgroundFile = new File(
      [removedBackground.blob],
      `${pixelId}_nobg.png`,
      {
        type: 'image/png',
      }
    )

    const noBgUpload = await uploadApi.uploadFiles([removedBackgroundFile])

    if (!noBgUpload.length || noBgUpload[0].error) {
      const error = noBgUpload[0]?.error ?? 'Failed to upload no-background PNG'
      console.error(
        '[postProcessPixelIcon] Failed to upload no-background PNG:',
        error
      )
      after(async () => {
        await updatePostProcessingStatus({
          pixelId,
          status: PostProcessingStatus.BACKGROUND_REMOVAL_FAILED,
          completedAt: new Date(),
          errorMessage: String(error),
        })
      })
      return { success: false, error: String(error) }
    }

    const noBgFileKey = noBgUpload[0].data.key
    const noBgPngUrl = getPublicPixelAsset(noBgFileKey)

    // Save as pixel version and mark post-processing complete
    await Promise.all([
      insertPixelVersion({
        pixelId,
        fileKey: noBgFileKey,
        gridSettings: DEFAULT_GRID_SETTINGS,
      }),
      updatePostProcessingStatus({
        pixelId,
        status: PostProcessingStatus.COMPLETED,
        completedAt: new Date(),
      }),
    ])

    return { success: true, noBgPngUrl, noBgFileKey }
  } catch (error) {
    console.error('[postProcessPixelIcon] Error: ', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
