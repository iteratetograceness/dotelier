import { credits } from '@/app/utils/credits'
import { authorizeRequest } from '@/lib/auth/request'
import { ERROR_CODES } from '@/lib/error'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await authorizeRequest()

  if (!auth.success) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const remaining = await credits.get(auth.user.id)
    return NextResponse.json({ credits: remaining })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
