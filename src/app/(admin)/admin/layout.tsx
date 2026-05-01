import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check env vars first — fail loudly if misconfigured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Supabase Not Configured</h1>
          <p className="text-white/60 text-sm">
            Add <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to Vercel environment variables, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  let user: any = null
  let profile: any = null

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    user = u

    if (!user) redirect('/admin/login')

    const { data: p } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single()
    profile = p
  } catch (e: any) {
    // Don't crash on Supabase errors — redirect to login
    if (e?.message?.includes('NEXT_REDIRECT')) throw e // let redirect work
    redirect('/admin/login')
  }

  if (!profile || !['admin', 'super_admin', 'dpo', 'grievance_officer'].includes(profile.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans">
      <AdminSidebar role={profile.role} name={profile.name ?? 'Admin'} email={user.email!} />
      <main className="flex-1 overflow-y-auto bg-[#0f1117]">
        <div className="min-h-full">{children}</div>
      </main>
      <Toaster theme="dark" position="top-right" />
    </div>
  )
}
