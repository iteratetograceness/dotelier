import { authorizeRequest } from '@/lib/auth/request'
import { getPixelsByOwner } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeRequest()

    if (!authResult.success) {
      return NextResponse.json(
        { error: ERROR_CODES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const ownerId = authResult.user.id
    const page = request.nextUrl.searchParams.get('p') ?? '0'
    const pixels = await getPixelsByOwner({
      ownerId,
      page: parseInt(page),
    })
    return NextResponse.json(pixels)
  } catch (error) {
    console.error('[GET /api/pixels]: ', error)
    return NextResponse.json(
      { error: 'Failed to fetch pixels' },
      { status: 500 }
    )
  }
}
