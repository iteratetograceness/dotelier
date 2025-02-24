import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminMiddleware } from './lib/auth'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/admin')) {
    return adminMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
