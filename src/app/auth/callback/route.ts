import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure profile has role=student for Google sign-ups
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', data.user.id)
        .single()

      if (!profile?.role) {
        const name = data.user.user_metadata?.full_name
          ?? data.user.user_metadata?.name
          ?? data.user.email?.split('@')[0]
          ?? 'Student'

        await supabase.from('profiles').update({
          name,
          role: 'student',
          consent_at: new Date().toISOString(),
          policy_version: '1.0',
        }).eq('id', data.user.id)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
