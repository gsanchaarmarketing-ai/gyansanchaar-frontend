import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ParentalConsentFlow from '@/components/dashboard/ParentalConsentFlow'

export default async function ParentalConsentPage() {
  const token = await getToken()
  if (!token) redirect('/login')
  let me
  try { me = await studentApi.me(token) } catch { redirect('/login') }
  if (!me.user.is_minor) redirect('/dashboard')
  if (me.user.parental_consent_verified) redirect('/dashboard')
  const status = await studentApi.parentalConsentStatus(token).catch(() => null)

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">👨‍👩‍👧</div>
          <h1 className="text-xl font-bold">Parent Verification</h1>
          <p className="text-slate-500 text-sm mt-1">
            Indian law (DPDP Act 2023 §9) requires a parent or guardian to verify consent before you can submit college applications. Takes 2 minutes.
          </p>
        </div>
        <ParentalConsentFlow token={token} existingParent={status?.parent ?? null} />
      </main>
      <MobileNav />
    </>
  )
}
