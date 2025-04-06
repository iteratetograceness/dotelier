import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getSession } from './lib/auth/session'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/admin')) {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
