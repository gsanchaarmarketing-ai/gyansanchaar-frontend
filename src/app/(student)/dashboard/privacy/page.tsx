import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ConsentManager from '@/components/dashboard/ConsentManager'
import ErasureButton from '@/components/dashboard/ErasureButton'

export default async function PrivacyPage() {
  const token = await getToken()
  if (!token) redirect('/login')
  let me, summary
  try {
    [me, summary] = await Promise.all([
      studentApi.me(token),
      studentApi.dataSummary(token),
    ])
  } catch { redirect('/login') }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold mb-1">Privacy & Data</h1>
        <p className="text-slate-500 text-sm mb-6">Your rights under the Digital Personal Data Protection Act, 2023</p>

        {/* Data summary — DPDP §11 right to access */}
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-sm mb-3">Data we hold about you</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Applications', summary.applications_count],
              ['Documents', summary.documents_count],
              ['Account created', new Date(me.user.id).toLocaleDateString?.() ?? '—'],
            ].map(([k,v])=>(
              <div key={String(k)} className="flex justify-between">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 text-xs text-slate-400">
            Application data is retained for {summary.data_retention?.application_days} days after admission cycle closes.
            Logs retained for {summary.data_retention?.log_days} days (CERT-In 2022 requirement).
          </div>
        </section>

        {/* Consent management — DPDP §6 */}
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-sm mb-3">Consent</h2>
          <ConsentManager initialState={me.consent_state} token={token} />
        </section>

        {/* Grievance officer — IT Rules 2021 */}
        <section className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-sm mb-3">Grievance Officer</h2>
          <p className="text-sm text-slate-600">For data-related complaints, contact:</p>
          <div className="mt-2 text-sm space-y-1">
            <div><span className="text-slate-500">Email: </span><a href="mailto:grievance@gyansanchaar.cloud" className="text-brand-600">grievance@gyansanchaar.cloud</a></div>
            <div><span className="text-slate-500">Resolution SLA: </span>90 days (DPDP Rules 2025)</div>
          </div>
          <a href="/grievance" className="mt-3 block text-brand-600 text-sm font-medium">File a grievance →</a>
        </section>

        {/* Erasure — DPDP §12 */}
        <section className="bg-rose-50 border border-rose-200 rounded-xl p-5">
          <h2 className="font-semibold text-sm text-rose-800 mb-2">Request Account Deletion</h2>
          <p className="text-xs text-rose-700 mb-3">
            We will send a 48-hour advance notice email, then erase your data subject to mandatory
            retention (CERT-In 180-day logs, 3-year application records for regulatory purposes).
          </p>
          <ErasureButton token={token} />
        </section>
      </main>
      <MobileNav />
    </>
  )
}
