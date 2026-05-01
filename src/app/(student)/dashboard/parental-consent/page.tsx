import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentalConsentPage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_minor) redirect('/dashboard')

  const { data: consent } = await sb.from('parental_consents').select('*').eq('user_id', user.id).maybeSingle()

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-5 pb-24">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <div className="bg-white border border-border rounded-2xl p-5">
          {profile.parental_consent_verified ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <h1 className="text-lg font-bold text-heading">Parent Consent Verified</h1>
              </div>
              <p className="text-muted text-sm">Your parent has verified consent. You can now apply to colleges.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-6 h-6 text-warning" />
                <h1 className="text-lg font-bold text-heading">Parent Consent Required</h1>
              </div>
              <p className="text-muted text-sm mb-4">
                You're under 18. As per <strong>DPDP Act 2023 §9</strong>, your parent must verify consent before
                you can apply to colleges through GyanSanchaar.
              </p>
              <p className="text-muted text-sm mb-5">
                Please contact our team at <a href="mailto:dpo@gyansanchaar.com" className="text-primary">dpo@gyansanchaar.com</a> to
                initiate the consent flow. Your parent will receive a verification link via WhatsApp/email.
              </p>
              {consent && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  Consent request initiated to <strong>{consent.parent_name}</strong> ({consent.parent_phone}). Awaiting verification.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
