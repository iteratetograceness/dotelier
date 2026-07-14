'use server'

import { authorizeRequest } from '@/lib/auth/request'
import {
  getLatestPixelVersion,
  insertPixelVersion,
  isPixelOwner,
} from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { uploadApi } from '@/lib/ut/server'
import { revalidateTag } from 'next/cache'
import { after } from 'next/server'

const MAX_SVG_BYTES = 512 * 1024

// Reject SVG payloads containing active content. Generated icons never include
// these, so blocking them here stops a malicious client from storing an SVG
// that executes script when opened directly from the asset host.
const ACTIVE_CONTENT = [
  /<script[\s/>]/i,
  /<foreignObject[\s/>]/i,
  /\son\w+\s*=/i,
  /javascript:/i,
  /<!ENTITY/i,
]

function isValidSvg(svgContent: unknown): svgContent is string {
  if (typeof svgContent !== 'string' || svgContent.length === 0) return false
  if (Buffer.byteLength(svgContent, 'utf8') > MAX_SVG_BYTES) return false
  const trimmed = svgContent.trimStart()
  if (!trimmed.startsWith('<svg') && !trimmed.startsWith('<?xml')) return false
  return !ACTIVE_CONTENT.some((pattern) => pattern.test(svgContent))
}

export async function savePixel({
  id,
  version,
  svgContent,
  gridSize,
}: {
  id: string
  version: number
  oldFileKey?: string
  svgContent: string
  gridSize: number
}) {
  try {
    const authorized = await authorizeRequest()

    if (!authorized.success) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    // Verify user owns this pixel
    const ownsPixel = await isPixelOwner(id, authorized.user.id)
    if (!ownsPixel) {
      return { error: ERROR_CODES.UNAUTHORIZED, success: false }
    }

    if (!isValidSvg(svgContent)) {
      return { error: ERROR_CODES.INVALID_BODY, success: false }
    }

    if (!Number.isInteger(version) || version < 0) {
      return { error: ERROR_CODES.INVALID_BODY, success: false }
    }

    if (!Number.isInteger(gridSize) || gridSize < 1 || gridSize > 256) {
      return { error: ERROR_CODES.INVALID_BODY, success: false }
    }

    // Derive the file to replace from the DB rather than trusting the client,
    // so a caller can't delete an arbitrary (e.g. another user's) asset by
    // passing its file key.
    const currentVersion = await getLatestPixelVersion(id)
    const oldFileKey = currentVersion?.fileKey

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
    const maybeDeleteUpload =
      oldFileKey && oldFileKey !== newFileKey
        ? uploadApi.deleteFiles([oldFileKey])
        : Promise.resolve()

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
