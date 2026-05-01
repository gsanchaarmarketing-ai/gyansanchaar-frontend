import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ProfileForm from '@/components/dashboard/ProfileForm'
import { getStates } from '@/lib/supabase-api'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, states] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).single(),
    getStates(),
  ])

  if (!profile) redirect('/login')

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold mb-5">My Profile</h1>
        <ProfileForm user={{ ...profile, email: user.email }} states={states} />
      </main>
      <MobileNav />
    </>
  )
}
