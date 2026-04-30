import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin', 'dpo', 'grievance_officer'].includes(profile.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans">
      <AdminSidebar role={profile.role} name={profile.name} email={user.email!} />
      <main className="flex-1 overflow-y-auto bg-[#0f1117]">
        <div className="min-h-full">
          {children}
        </div>
      </main>
      <Toaster theme="dark" position="top-right" />
    </div>
  )
}
