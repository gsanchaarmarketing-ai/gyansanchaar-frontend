'use client'
import { useState } from 'react'
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react'

export default function ParentConsentPage({ params }: { params: { token: string } }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'success'|'error'|null>(null)
  const [error, setError] = useState('')

  async function verify() {
    if (otp.length < 6) { setError('Enter 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/parental-consent/verify`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ code: otp, token: params.token }),
      })
      if (res.ok) setResult('success')
      else { const d = await res.json(); setError(d.message ?? 'Invalid OTP') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <GraduationCap className="w-10 h-10 text-brand-600 mx-auto mb-2" />
          <div className="font-bold text-xl text-brand-600">GyanSanchaar</div>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          {result === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-bold text-lg mb-2">Consent Verified!</h2>
              <p className="text-slate-500 text-sm">Your ward can now submit college applications on GyanSanchaar.</p>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg mb-1">Parental Consent</h2>
              <p className="text-slate-500 text-sm mb-4">
                Your ward has registered on GyanSanchaar. Indian law (DPDP Act 2023 §9) requires your consent to process their college applications.
              </p>
              <label className="block text-sm font-medium mb-2">Enter the OTP sent to your WhatsApp</label>
              <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                placeholder="6-digit OTP" className="w-full border rounded-lg px-4 py-3 text-center text-xl font-bold tracking-widest mb-3" />
              {error && <p className="text-rose-600 text-sm mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
              <button onClick={verify} disabled={loading || otp.length < 6}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60">
                {loading ? 'Verifying…' : 'Verify & Give Consent'}
              </button>
              <p className="text-xs text-slate-400 mt-4 text-center">
                By verifying, you consent to GyanSanchaar processing your ward's data for college applications only.
                You may withdraw consent at <a href="mailto:grievance@gyansanchaar.cloud" className="underline">grievance@gyansanchaar.cloud</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
