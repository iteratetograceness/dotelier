import { authorizeRequest } from '@/lib/auth/request'
import { getLatestPixelVersion } from '@/lib/db/queries'
import { ERROR_CODES } from '@/lib/error'
import { NextRequest, NextResponse } from 'next/server'

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

  const data = await getLatestPixelVersion(id)

  return NextResponse.json(data)
}
