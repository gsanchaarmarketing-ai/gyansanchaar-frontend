import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ApplicationWizard from '@/components/dashboard/ApplicationWizard'

export default async function ApplicationFormPage() {
  const token = await getToken()
  if (!token) redirect('/login')

  let me
  try { me = await studentApi.me(token) }
  catch { redirect('/login') }

  const [statesRes, coursesRes] = await Promise.allSettled([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/states`).then(r => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/courses?per_page=50`).then(r => r.json()),
  ])

  const states = statesRes.status === 'fulfilled' ? statesRes.value.data : []
  const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data : []

  return (
    <>
      <Header isLoggedIn />
      <main className="max-w-xl mx-auto px-4 py-6 pb-28 md:pb-10">
        <h1 className="text-xl font-bold mb-1">Application Form</h1>
        <p className="text-slate-500 text-sm mb-6">
          Fill once. Apply to any college with one click.
        </p>
        <ApplicationWizard user={me.user} states={states} courses={courses} token={token} />
      </main>
      <MobileNav />
    </>
  )
}
