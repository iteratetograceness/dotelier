import { authorizeRequest } from '@/lib/auth/request'
import { getLatestPixelVersion, isExplorePagePixel } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { NextRequest, NextResponse } from 'next/server'
import { isPixelOwner } from './../../../../../lib/db/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [authorization, { id }] = await Promise.all([
    authorizeRequest(),
    params,
  ])

  const [isExplorePage, isOwner] = await Promise.all([
    isExplorePagePixel(id),
    authorization.success ? isPixelOwner(id, authorization.user.id) : false,
  ])

  if (!authorization.success && !isExplorePage) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  const data = await getLatestPixelVersion(id)

  if (!data) {
    return NextResponse.json(
      { error: ERROR_CODES.ICON_NOT_FOUND },
      { status: 404 }
    )
  }

  if (!isOwner && !isExplorePage) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  return NextResponse.json(data)
}
