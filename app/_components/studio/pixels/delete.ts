'use server'

import { authorizeRequest } from '@/lib/auth/request'
import { deletePixel, isPixelOwner } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePixelAction(pixelId: string) {
  const authorized = await authorizeRequest()

  if (!authorized.success) {
    return { error: ERROR_CODES.UNAUTHORIZED, success: false }
  }

  const ownsPixel = await isPixelOwner(pixelId, authorized.user.id)
  if (!ownsPixel) {
    return { error: ERROR_CODES.UNAUTHORIZED, success: false }
  }

  try {
    const deletedId = await deletePixel(pixelId)

    if (!deletedId) {
      return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
    }

    revalidateTag(`pixel:${pixelId}`, { expire: 0 })
    revalidateTag(`getLatestPixelIds:${authorized.user.id}`, { expire: 0 })
    revalidateTag('explore-pixels', { expire: 0 })
  } catch (error) {
    return { error: ERROR_CODES.UNEXPECTED_ERROR, success: false }
  }

  redirect('/studio')
}
