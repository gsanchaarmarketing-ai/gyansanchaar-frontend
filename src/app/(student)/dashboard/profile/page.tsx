import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi, publicApi, ApiError } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ProfileForm from '@/components/dashboard/ProfileForm'
import DashboardLoadError from '@/components/dashboard/DashboardLoadError'

export default async function ProfilePage() {
  const token = await getToken()
  if (!token) redirect('/login')

  let me
  try {
    me = await studentApi.me(token)
  } catch (err: any) {
    console.error('[profile load failed]', { status: err?.status, message: err?.message, data: err?.data })
    if (err instanceof ApiError && err.status === 401) redirect('/login')
    return <DashboardLoadError reason={err?.message ?? 'Unknown'} status={err?.status ?? 0} />
  }
  const statesData = await publicApi.states().catch(() => ({ data: [] }))

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold mb-5">My Profile</h1>
        <ProfileForm user={me.user} states={statesData.data} token={token} />
      </main>
      <MobileNav />
    </>
  )
}
