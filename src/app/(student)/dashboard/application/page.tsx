import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getStates } from '@/lib/supabase-api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ProfileForm from '@/components/dashboard/ProfileForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApplicationProfilePage() {
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
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>
        <h1 className="text-xl font-bold mb-2">Complete your profile</h1>
        <p className="text-muted text-sm mb-5">Fill these once — apply to any college with one tap.</p>
        <ProfileForm user={{ ...profile, email: user.email }} states={states} />
      </main>
      <MobileNav />
    </>
  )
}
