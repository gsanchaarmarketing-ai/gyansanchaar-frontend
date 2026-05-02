'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

function LoginForm() {
  const sp         = useSearchParams()
  const redirectTo = sp.get('redirect') ?? '/dashboard'

  const [step,    setStep]    = useState<'email' | 'otp'>('email')
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [sentAt,  setSentAt]  = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true)
    try {
      const { error: err } = await createBrowserSupabaseClient()
        .auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (err) throw err
      setSentAt(Date.now())
      setStep('otp')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (e: any) {
      const msg = e.message ?? ''
      if (msg.includes('Signups not allowed') || msg.includes('not found') || msg.includes('user not found')) {
        setError('No account found. Please register first.')
      } else {
        setError(msg || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(token: string) {
    setError('')
    setLoading(true)
    try {
      const { error: err } = await createBrowserSupabaseClient()
        .auth.verifyOtp({ email, token, type: 'email' })
      if (err) throw err
      window.location.href = redirectTo
    } catch {
      setError('Invalid or expired OTP. Please try again.')
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
    setError('')
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

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors'

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-6">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-1">Log in with your email OTP</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">

        {step === 'email' && (
          <form onSubmit={sendOtp} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID</label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className={inp} placeholder="you@email.com" autoFocus />
            </div>
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending OTP…</> : 'Send OTP →'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
            <button onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Change email
            </button>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800">OTP sent to <strong className="break-all">{email}</strong></p>
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
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl text-center">{error}</div>}

            <div className="text-center text-sm text-slate-500">
              Didn't receive it?{' '}
              {canResend
                ? <button onClick={() => sendOtp()} className="text-blue-600 font-semibold hover:underline">Resend OTP</button>
                : <span className="text-slate-400">Resend in 30s</span>}
            </div>
            <p className="text-xs text-slate-400 text-center">Valid for 10 minutes · Do not share with anyone</p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            New to GyanSanchaar?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create free account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
