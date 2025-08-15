import { authorizeRequest } from '@/lib/auth/request'
import { getPixelsMetadataByOwner } from '@/lib/db/queries'
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
  const page = pageParam ? Number(pageParam) : 1

  const result = await getPixelsMetadataByOwner({
    ownerId: authorization.user.id,
    page,
    withPrompt: true,
    limit: 20,
  })

  return NextResponse.json(result)
}
