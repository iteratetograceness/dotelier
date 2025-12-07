'use server'

import { authorizeRequest } from '@/lib/auth/request'
import { insertPixelVersion } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { uploadApi } from '@/lib/ut/server'
import { revalidateTag } from 'next/cache'
import { after } from 'next/server'

export async function savePixel({
  id,
  oldFileKey,
  version,
  svgContent,
  gridSize,
}: {
  id: string
  version: number
  oldFileKey: string
  svgContent: string
  gridSize: number
}) {
  try {
    const authorized = await authorizeRequest()

    if (!authorized.success) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    const newVersion = version + 1
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const svgFile = new File([blob], `${id}-${newVersion}.svg`, {
      type: 'image/svg+xml',
    })

    const uploadedResult = await uploadApi.uploadFiles([svgFile])

    if (!uploadedResult.length || uploadedResult[0].error) {
      console.error(
        '[savePixel] Failed to upload SVG version: ',
        uploadedResult[0].error
      )
      return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
    }

    const newFileKey = uploadedResult[0].data.key
    const maybeDeleteUpload = uploadApi.deleteFiles([oldFileKey])

    try {
      await insertPixelVersion({
        pixelId: id,
        fileKey: newFileKey,
        version: newVersion,
        gridSize,
      })
    } catch (error) {
      after(async () => {
        try {
          await maybeDeleteUpload
        } catch (err) {
          console.error('[savePixel] Failed to rollback uploaded file:', err)
        }
      })

      return { error: ERROR_CODES.FAILED_TO_SAVE_ICON, success: false }
    }

    console.log(
      `[savePixel] Pixel ${id} updated. From ${oldFileKey} to ${newFileKey}`
    )

    revalidateTag(`pixel:${id}`, { expire: 0 })

    return { success: true, fileKey: newFileKey }
  } catch (error) {
    return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
  }
}
