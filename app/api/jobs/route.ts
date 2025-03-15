import { authorizeRequest } from '@/app/db/supabase/auth'
import { getJobs } from '@/app/db/supabase/queries'
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

    const page = request.nextUrl.searchParams.get('p') ?? '0'
    const jobs = await getJobs({ page: parseInt(page) })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('[GET /api/jobs]: ', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
