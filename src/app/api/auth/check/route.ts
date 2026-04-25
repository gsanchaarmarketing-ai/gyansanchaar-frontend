import { NextResponse } from 'next/server'
import { getToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Client components call this to get the token without needing document.cookie
// Safe because it only reads from httpOnly cookie server-side and returns token
// The token itself is not secret from the user — it's their own auth token
export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ token: null, authenticated: false })
  return NextResponse.json({ token, authenticated: true })
}
