import { authorizeRequest } from '@/lib/auth/request'
import { getPixelsWithVersionsByOwner } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest()

  if (!authorization.success) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const pageParam = searchParams.get('page')
  const parsedPage = pageParam ? Number(pageParam) : 1
  // Guard against NaN / negative / non-integer values, which would otherwise
  // produce an invalid SQL OFFSET.
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1
      ? Math.floor(parsedPage)
      : 1

  const result = await getPixelsWithVersionsByOwner({
    ownerId: authorization.user.id,
    page,
    limit: 20,
  })

  return NextResponse.json(result)
}
