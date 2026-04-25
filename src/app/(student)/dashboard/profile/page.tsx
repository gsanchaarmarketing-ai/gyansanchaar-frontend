import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ProfileForm from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
  const token = await getToken()
  if (!token) redirect('/login')
  let me
  try { me = await studentApi.me(token) } catch { redirect('/login') }
  const statesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/states`).then(r=>r.json()).catch(()=>({data:[]}))

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold mb-5">My Profile</h1>
        <ProfileForm user={me.user} states={statesRes.data} token={token} />
      </main>
      <MobileNav />
    </>
  )
}
