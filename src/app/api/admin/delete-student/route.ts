import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    // Verify caller is admin
    const sb   = await createServerSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await sb
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createAdminSupabaseClient()

    // Soft-delete profile first
    await sb.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', id)

    // Delete auth user (hard delete — removes email/session)
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Delete failed' }, { status: 500 })
  }
}
