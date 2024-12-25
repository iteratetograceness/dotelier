import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  console.log('hit middleware!')

  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const verified = await verifyToken(token)

  if (!verified) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/style/:path*', '/admin/:path*'],
}
