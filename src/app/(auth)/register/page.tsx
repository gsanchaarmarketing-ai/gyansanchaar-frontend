'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2, Shield } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70 ${className}`} />
)

function Countdown({ sentAt, onExpire }: { sentAt: number; onExpire: () => void }) {
  const [sec, setSec] = useState(30)
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = Math.max(0, 30 - Math.floor((Date.now() - sentAt) / 1000))
      setSec(remaining)
      if (remaining === 0) { clearInterval(id); onExpire() }
    }, 500)
    return () => clearInterval(id)
  }, [sentAt, onExpire])
  return <span className="tabular-nums text-slate-400">Resend in {sec}s</span>
}

type Step = 'form' | 'otp' | 'done'

const Field = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
    {children}
    {error && <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-[10px]">!</span>{error}</p>}
  </div>
)

const inputCls = (err?: string) =>
  `w-full border-2 ${err ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpErr, setOtpErr] = useState('')
  const [sentAt, setSentAt] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '' })
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function f(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }))
      setErrors(p => { const n = { ...p }; delete n[k]; return n })
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Minimum 2 characters'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = '10-digit number required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { error: err } = await createBrowserSupabaseClient()
        .auth.signInWithOtp({
          email: form.email,
          options: { shouldCreateUser: true, data: { name: form.name } },
        })
      if (err) throw err
      setSentAt(Date.now())
      setCanResend(false)
      setStep('otp')
      setTimeout(() => inputRefs.current[0]?.focus(), 120)
    } catch (e: any) {
      const msg = (e.message ?? '') as string
      if (msg.includes('already registered')) {
        setErrors({ email: 'Already registered — please log in instead' })
      } else {
        setErrors({ email: msg || 'Failed to send OTP. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(token: string) {
    setOtpErr('')
    setLoading(true)
    try {
      const sb = createBrowserSupabaseClient()
      const { data, error: verifyErr } = await sb.auth.verifyOtp({ email: form.email, token, type: 'email' })
      if (verifyErr) throw verifyErr
      const uid = data.user?.id
      if (!uid) throw new Error('Verification failed')
      const phone = form.phone.replace(/\D/g, '').slice(-10)
      const isMinor = form.dob ? (new Date().getFullYear() - new Date(form.dob).getFullYear()) < 18 : false
      await sb.from('profiles').update({
        name: form.name, phone, dob: form.dob || null,
        is_minor: isMinor, consent_at: new Date().toISOString(),
        policy_version: '1.0', role: 'student',
      }).eq('id', uid)
      await sb.from('consent_records').insert([
        { user_id: uid, purpose: 'application', action: 'granted', policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'communication', action: 'granted', policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'marketing', action: 'withdrawn', policy_version: '1.0', source: 'registration' },
      ])
      setStep('done')
      setTimeout(() => { window.location.href = '/dashboard' }, 700)
    } catch {
      setOtpErr('Invalid or expired OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next); setOtpErr('')
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every(d => d !== '')) verifyOtp(next.join(''))
  }

  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) { setOtp(digits.split('')); verifyOtp(digits) }
  }

  if (step === 'done') return (
    <div className="w-full max-w-md mx-auto md:ml-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        <h2 className="text-xl font-bold text-slate-800">Account created! Taking you in…</h2>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {step === 'form' ? 'Create free account' : 'Verify your email'}
        </h1>
        <p className="text-white/60 text-sm mt-1.5">
          {step === 'form' ? 'Apply to verified colleges. Always ₹0.' : `OTP sent to ${form.email}`}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {step === 'form' && (
          <>
            <div className="p-6 pb-0">
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl py-3 text-sm font-semibold text-slate-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-60 shadow-sm">
                {googleLoading ? <Spinner /> : <GoogleIcon />}
                {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
              </button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or fill in your details</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </div>

            <form onSubmit={sendOtp} className="px-6 pb-6 space-y-4" noValidate>
              <Field label="Full Name *" error={errors.name}>
                <input value={form.name} onChange={f('name')} autoFocus className={inputCls(errors.name)} placeholder="As on marksheet" />
              </Field>

              <Field label="Email ID *" error={errors.email}>
                <input type="email" value={form.email} onChange={f('email')} className={inputCls(errors.email)} placeholder="you@email.com" />
              </Field>

              <Field label="WhatsApp Number *" error={errors.phone}>
                <div className="flex gap-2">
                  <div className="flex items-center px-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm text-slate-500 shrink-0 font-medium">🇮🇳 +91</div>
                  <input type="tel" value={form.phone} onChange={f('phone')}
                    className={`${inputCls(errors.phone)} flex-1`}
                    placeholder="10-digit number" maxLength={10} inputMode="numeric" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Admission updates via WhatsApp</p>
              </Field>

              <Field label="Date of Birth (optional)">
                <input type="date" value={form.dob} onChange={f('dob')}
                  className={inputCls()} max={new Date().toISOString().split('T')[0]} />
              </Field>

              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl p-3.5">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  By signing up you agree to our{' '}
                  <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>{' '}and{' '}
                  <Link href="/terms" className="text-blue-600 underline">Terms</Link>.
                  Protected under <strong>DPDP Act 2023</strong>. We never sell your data.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-2xl font-bold text-sm transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                {loading ? <><Spinner className="!text-white" />Sending OTP…</> : 'Send OTP to Email →'}
              </button>

              <p className="text-sm text-center text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <div className="p-6 space-y-5">
            <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpErr('') }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800">OTP sent to</p>
                <p className="text-sm text-blue-700 break-all font-medium">{form.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    disabled={loading}
                    className={`w-11 py-3 text-center text-2xl font-bold border-2 rounded-2xl focus:outline-none transition-all duration-150 disabled:opacity-40
                      ${digit ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105' : 'border-slate-200 text-slate-800'}
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`}
                  />
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <Spinner /> Verifying…
              </div>
            )}
            {otpErr && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium px-4 py-3 rounded-2xl text-center">
                {otpErr}
              </div>
            )}

            <div className="text-center text-sm text-slate-500">
              Didn't get it?{' '}
              {canResend
                ? <button onClick={() => { setCanResend(false); sendOtp() }}
                    className="text-blue-600 font-semibold hover:underline">Resend OTP</button>
                : <Countdown sentAt={sentAt} onExpire={() => setCanResend(true)} />
              }
            </div>
            <p className="text-xs text-slate-300 text-center">Valid 10 minutes · Never share your OTP</p>
          </div>
        )}
      </div>

      {step === 'form' && (
        <div className="flex items-center justify-center gap-5 mt-5">
          {['100% Free', 'DPDP Compliant', 'UGC Verified'].map(b => (
            <div key={b} className="flex items-center gap-1 text-[11px] text-white/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />{b}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
