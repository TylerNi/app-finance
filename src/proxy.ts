import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, readSessionValue } from '@/lib/session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname.startsWith('/api/')) return NextResponse.next()
  if (readSessionValue(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next()

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)'],
}
