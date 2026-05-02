'use client'

import { Suspense, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'

function VerifyOtpContent() {
  const sp    = useSearchParams()
  const email = sp.get('email') ?? ''

  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function verifyOtp(token: string) {
    setError('')
    setLoading(true)
    try {
      const { error: err } = await createBrowserSupabaseClient()
        .auth.verifyOtp({ email, token, type: 'email' })
      if (err) throw err
      window.location.href = '/dashboard'
    } catch {
      setError('Invalid or expired OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    setError('')
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every(d => d !== '')) verifyOtp(next.join(''))
  }

  function handleKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) { setOtp(digits.split('')); verifyOtp(digits) }
  }

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-6">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="text-white/60 text-sm mt-1">Enter the OTP we sent to your inbox</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Mail className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">OTP sent to <strong className="break-all">{email}</strong></p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Enter 6-digit OTP</label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                disabled={loading}
                autoFocus={i === 0}
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

        <p className="text-xs text-slate-400 text-center">Valid for 10 minutes · Do not share with anyone</p>

        <div className="border-t pt-4 text-center">
          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return <Suspense><VerifyOtpContent /></Suspense>
}
