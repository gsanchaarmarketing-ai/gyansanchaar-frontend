import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const STUDENT_PROTECTED = ['/dashboard']
const ADMIN_PROTECTED   = ['/admin']
const AUTH_PAGES        = ['/login', '/register', '/verify-otp']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsStudentAuth = STUDENT_PROTECTED.some(p => pathname.startsWith(p))
  const needsAdminAuth   = ADMIN_PROTECTED.some(p => pathname.startsWith(p)) && pathname !== '/admin/login'
  const isAuthPage       = AUTH_PAGES.some(p => pathname.startsWith(p))

  // Public pages — skip Supabase entirely, no auth check needed
  if (!needsStudentAuth && !needsAdminAuth && !isAuthPage) {
    return NextResponse.next()
  }

  // Only call Supabase on pages that need auth
  let user = null
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase unreachable — treat as unauthenticated
    // Public pages already returned above, so this only affects /dashboard /admin
    if (needsStudentAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    if (needsAdminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Fetch role when we have a user and need routing decisions
  let userRole: string | null = null
  if (user && (needsStudentAuth || isAuthPage)) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = profile?.role ?? null
    } catch {
      userRole = null
    }
  }

  const isStudent = userRole === 'student'
  const isAdmin   = userRole !== null && userRole !== 'student'

  // Student dashboard protection
  if (needsStudentAuth) {
    if (!user || !isStudent) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Admin protection
  if (needsAdminAuth && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect logged-in users away from student auth pages
  if (isAuthPage && user) {
    if (isAdmin)   return NextResponse.redirect(new URL('/admin', request.url))
    if (isStudent) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Only run middleware on pages that could need auth
  // Exclude all static assets, api routes, images
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/verify-otp',
  ],
}
