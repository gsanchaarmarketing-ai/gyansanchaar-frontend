'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react'

export default function ParentConsentPage({ params }: { params: { token: string } }) {
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<'success' | 'error' | null>(null)
  const [error,   setError]   = useState('')

  async function verify() {
    if (otp.length < 6) { setError('Enter 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const sb = createBrowserSupabaseClient()

      // Look up the parental consent record by token
      const { data: consent, error: fetchErr } = await sb
        .from('parental_consents')
        .select('*')
        .eq('verification_token', params.token)
        .is('verified_at', null)
        .single()

      if (fetchErr || !consent) {
        setError('Invalid or expired link. Please ask your ward to request a new one.')
        return
      }

      // Check OTP matches
      if (consent.code_hash !== otp) {
        setError('Incorrect OTP. Please try again.')
        return
      }

      // Mark verified
      await sb.from('parental_consents').update({
        verified_at: new Date().toISOString(),
        verified_ip: null,
      }).eq('id', consent.id)

      // Update student profile
      await sb.from('profiles').update({
        parental_consent_verified: true,
        parental_consent_at: new Date().toISOString(),
      }).eq('id', consent.user_id)

      setResult('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <GraduationCap className="w-10 h-10 text-primary mx-auto mb-2" />
          <div className="font-bold text-xl text-primary">GyanSanchaar</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
          {result === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-bold text-lg mb-2">Consent Verified!</h2>
              <p className="text-slate-500 text-sm">
                Your ward can now submit college applications on GyanSanchaar.
              </p>
              <p className="text-xs text-muted mt-4">
                You may withdraw consent at any time by emailing{' '}
                <a href="mailto:grievance@gyansanchaar.com" className="text-primary underline">
                  grievance@gyansanchaar.com
                </a>
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg mb-1">Parental Consent</h2>
              <p className="text-slate-500 text-sm mb-4">
                Your ward has registered on GyanSanchaar.
                Under the <strong>Digital Personal Data Protection Act 2023 §9</strong>, your consent
                is required before we process their data for college applications.
              </p>
              <label className="block text-sm font-medium mb-2">
                Enter the OTP sent to your WhatsApp number
              </label>
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
                className="w-full border border-border rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest mb-3 focus:outline-none focus:border-primary"
              />
              {error && (
                <p className="text-rose-600 text-sm mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}
              <button onClick={verify} disabled={loading || otp.length < 6}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-60 hover:bg-primary-hover transition-colors">
                {loading ? 'Verifying…' : 'Verify & Give Consent'}
              </button>
              <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
                By verifying, you consent to GyanSanchaar processing your ward's personal data
                for college application purposes only, as required by DPDP Act 2023.
                You may withdraw consent at{' '}
                <a href="mailto:grievance@gyansanchaar.com" className="underline text-primary">
                  grievance@gyansanchaar.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
