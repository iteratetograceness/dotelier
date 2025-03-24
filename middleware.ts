import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // if (request.nextUrl.pathname.includes('/admin')) {
  //   return adminMiddleware(request)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
