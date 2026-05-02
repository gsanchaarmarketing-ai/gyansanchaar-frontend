'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { GraduationCap, Mail, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

function GoogleButton() {
  const [loading, setLoading] = useState(false)
  async function handleGoogle() {
    setLoading(true)
    await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }
  return (
    <button onClick={handleGoogle} disabled={loading}
      className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60">
      {loading
        ? <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
        : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      }
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>
  )
}

type Step = 'form' | 'otp'

export default function RegisterPage() {
  const [step,    setStep]    = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState<Record<string, string>>({})
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const [otpErr,  setOtpErr]  = useState('')
  const [sentAt,  setSentAt]  = useState(0)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: ''
  })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function f(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }))
      setErr(p => ({ ...p, [k]: '' }))
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2)             e.name  = 'Min 2 characters'
    if (!/\S+@\S+\.\S+/.test(form.email))        e.email = 'Invalid email'
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = '10-digit number required'
    setErr(e)
    return Object.keys(e).length === 0
  }

  /* ── Step 1: send OTP ───────────────────────────────────────────── */
  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { error: authErr } = await createBrowserSupabaseClient()
        .auth.signInWithOtp({
          email: form.email,
          options: {
            shouldCreateUser: true,
            data: { name: form.name },
          },
        })
      if (authErr) throw authErr
      setSentAt(Date.now())
      setStep('otp')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (e: any) {
      const msg = e.message ?? ''
      if (msg.includes('already registered')) {
        setErr({ email: 'This email is already registered. Please log in.' })
      } else {
        setErr({ email: msg || 'Failed to send OTP. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: verify OTP + update profile ────────────────────────── */
  async function verifyOtp(token: string) {
    setOtpErr('')
    setLoading(true)
    try {
      const sb = createBrowserSupabaseClient()

      const { data, error: verifyErr } = await sb.auth.verifyOtp({
        email: form.email, token, type: 'email',
      })
      if (verifyErr) throw verifyErr

      const uid = data.user?.id
      if (!uid) throw new Error('Verification failed')

      const phone   = form.phone.replace(/\D/g, '').slice(-10)
      const isMinor = form.dob
        ? (new Date().getFullYear() - new Date(form.dob).getFullYear()) < 18
        : false

      await sb.from('profiles').update({
        name:           form.name,
        phone,
        dob:            form.dob || null,
        is_minor:       isMinor,
        consent_at:     new Date().toISOString(),
        policy_version: '1.0',
        role:           'student',
      }).eq('id', uid)

      await sb.from('consent_records').insert([
        { user_id: uid, purpose: 'application',   action: 'granted',   policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'communication', action: 'granted',   policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'marketing',     action: 'withdrawn', policy_version: '1.0', source: 'registration' },
      ])

      window.location.href = '/dashboard'
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
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    setOtpErr('')
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

  const canResend = sentAt === 0 || Date.now() - sentAt > 30_000
  const inp = (hasErr: boolean) =>
    `w-full border ${hasErr ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors`

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-6">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Create your free account</h1>
        <p className="text-white/60 text-sm mt-1">Apply to colleges in 10 minutes. Always ₹0.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">

        {/* ── Step 1: Registration form ── */}
        {step === 'form' && (
          <form onSubmit={sendOtp} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-rose-500">*</span></label>
              <input value={form.name} onChange={f('name')} className={inp(!!err.name)} placeholder="As on marksheet" />
              {err.name && <p className="text-rose-600 text-xs mt-1">{err.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID <span className="text-rose-500">*</span></label>
              <input type="email" value={form.email} onChange={f('email')} className={inp(!!err.email)} placeholder="you@email.com" />
              {err.email && <p className="text-rose-600 text-xs mt-1">{err.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Phone Number <span className="text-rose-500">*</span></label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 shrink-0">🇮🇳 +91</div>
                <input type="tel" value={form.phone} onChange={f('phone')} className={inp(!!err.phone) + ' flex-1'}
                  placeholder="10-digit number" maxLength={10} inputMode="numeric" />
              </div>
              {err.phone && <p className="text-rose-600 text-xs mt-1">{err.phone}</p>}
              <p className="text-xs text-slate-400 mt-1">You'll receive application updates on WhatsApp</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input type="date" value={form.dob} onChange={f('dob')} className={inp(false)}
                max={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> and{' '}
                <Link href="/terms" className="text-blue-600 underline">Terms</Link>.
                Your data is protected under the <strong>DPDP Act 2023</strong>. We never sell your data.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending OTP…</>
                : 'Send OTP to Email →'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP verify ── */}
        {step === 'otp' && (
          <div className="space-y-5">
            <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpErr('') }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800">OTP sent to <strong className="break-all">{form.email}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    disabled={loading}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />Verifying…
              </div>
            )}
            {otpErr && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl text-center">{otpErr}</div>}

            <div className="text-center text-sm text-slate-500">
              Didn't receive it?{' '}
              {canResend
                ? <button onClick={() => sendOtp()} className="text-blue-600 font-semibold hover:underline">Resend OTP</button>
                : <span className="text-slate-400">Resend in 30s</span>}
            </div>
            <p className="text-xs text-slate-400 text-center">Valid for 10 minutes · Do not share with anyone</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <p className="text-center text-xs text-slate-400 font-medium uppercase tracking-wide">Or sign up with</p>
          <GoogleButton />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          {['100% Free', 'DPDP Compliant', 'UGC Verified Colleges'].map(b => (
            <div key={b} className="flex items-center gap-1 text-[10px] text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />{b}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
