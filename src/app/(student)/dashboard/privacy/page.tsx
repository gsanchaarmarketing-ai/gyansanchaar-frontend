import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { ArrowLeft, Shield, Download, Trash2 } from 'lucide-react'
import ConsentManager from '@/components/dashboard/ConsentManager'
import ErasureButton from '@/components/dashboard/ErasureButton'

export const dynamic = 'force-dynamic'

export default async function PrivacyPage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: consents }, { data: docs }, { count: appCount }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).single(),
    sb.from('consent_records').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    sb.from('documents').select('id', { count: 'exact' }).eq('user_id', user.id).is('deleted_at', null),
    sb.from('applications').select('*', { count: 'exact', head: true }).eq('student_id', user.id).is('deleted_at', null),
  ])

  // Latest action per purpose
  const consentState: Record<string, boolean> = {}
  const seen = new Set<string>()
  for (const r of (consents ?? [])) {
    if (!seen.has(r.purpose)) { consentState[r.purpose] = r.action === 'granted'; seen.add(r.purpose) }
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-heading">Privacy & Data Settings</h1>
        </div>

        {/* Data summary */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-4">
          <h2 className="font-bold text-heading mb-3">Your data with GyanSanchaar</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-primary-light rounded-xl p-3">
              <div className="text-xl font-bold text-primary">{appCount ?? 0}</div>
              <div className="text-xs text-muted mt-0.5">Applications</div>
            </div>
            <div className="bg-primary-light rounded-xl p-3">
              <div className="text-xl font-bold text-primary">{docs?.length ?? 0}</div>
              <div className="text-xs text-muted mt-0.5">Documents</div>
            </div>
            <div className="bg-primary-light rounded-xl p-3">
              <div className="text-xl font-bold text-primary">{consents?.length ?? 0}</div>
              <div className="text-xs text-muted mt-0.5">Consent Logs</div>
            </div>
          </div>
        </div>

        {/* Consent management */}
        <ConsentManager initialState={consentState} />

        {/* Erasure */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mt-4">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-heading mb-1">Erase my data</h3>
              <p className="text-muted text-sm mb-3">
                Under <strong>DPDP Act 2023 §12</strong> you have the right to erasure. We'll delete all your
                personal data within 30 days. Some data may be retained for legal compliance.
              </p>
              <ErasureButton />
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
