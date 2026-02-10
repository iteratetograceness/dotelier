import { authorizeRequest } from '@/lib/auth/request'
import { ERROR_CODES } from '@/lib/error'
import { db } from '@/lib/db/pg'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Lightweight endpoint for generation recovery after page refresh.
 * Returns whether a pixel exists and has a completed version + post-processing result.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [authorization, { id }] = await Promise.all([
    authorizeRequest(),
    params,
  ])

  if (!authorization.success) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  const pixel = await db
    .selectFrom('pixel')
    .leftJoin('pixelVersion', (join) =>
      join
        .onRef('pixel.id', '=', 'pixelVersion.pixelId')
        .on('pixelVersion.isCurrent', '=', true)
    )
    .leftJoin('postProcessing', (join) =>
      join.onRef('pixel.id', '=', 'postProcessing.pixelId')
    )
    .select([
      'pixel.id',
      'pixel.userId',
      'pixelVersion.fileKey',
      'postProcessing.status as postProcessingStatus',
      'postProcessing.pngNobgFileKey',
    ])
    .where('pixel.id', '=', id)
    .executeTakeFirst()

  if (!pixel) {
    return NextResponse.json({ exists: false })
  }

  if (pixel.userId !== authorization.user.id) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  return NextResponse.json({
    exists: true,
    hasVersion: Boolean(pixel.fileKey),
    postProcessingStatus: pixel.postProcessingStatus ?? null,
    noBgFileKey: pixel.pngNobgFileKey ?? null,
  })
}
