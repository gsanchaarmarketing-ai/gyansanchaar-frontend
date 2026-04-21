import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Auth gate
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('gs_token')?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
}
