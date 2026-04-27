'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { studentApi } from '@/lib/api'
import { toast } from 'sonner'
import { GraduationCap, Mail, MessageCircle, RefreshCw } from 'lucide-react'

export default function VerifyOtpPage() {
  const sp        = useSearchParams()
  const phone     = sp.get('phone')   ?? ''
  const email     = sp.get('email')   ?? ''
  const purpose   = sp.get('purpose') ?? 'registration'
  const initialCh = (sp.get('channel') ?? 'whatsapp') as 'whatsapp' | 'email' | 'sms'

  const [channel,   setChannel]   = useState<'whatsapp' | 'email' | 'sms'>(initialCh)
  const [code,      setCode]      = useState(['','','','','',''])
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(600)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  function handleInput(i: number, v: string) {
    if (!/^\d?$/.test(v)) return
    const next = [...code]
    next[i] = v
    setCode(next)
    if (v && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every(c => c)) verify(next.join(''))
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  async function verify(otp: string) {
    setLoading(true)
    try {
      // Use phone for phone/whatsapp/sms channel; email for email channel
      const identifier = channel === 'email' && email ? email : phone
      const res: any = await studentApi.verifyOtp({ identifier, purpose, code: otp })

      if (res.token) {
        const setRes = await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: res.token }),
        })
        if (!setRes.ok) throw new Error('Failed to save login session.')
      }

      toast.success(channel === 'email' ? 'Email verified!' : 'Phone verified!')
      // Hard navigation — bypasses Next.js router cache so dashboard
      // renders fresh with the new cookie
      window.location.href = '/dashboard'
    } catch (e: any) {
      toast.error(e?.message ?? 'Invalid OTP. Please try again.')
      setCode(['','','','','',''])
      inputRefs.current[0]?.focus()
      setLoading(false)
    }
  }

  async function resend(forceChannel?: 'whatsapp' | 'email') {
    setResending(true)
    const ch = forceChannel ?? channel
    try {
      const identifier = ch === 'email' && email ? email : phone
      const type       = ch === 'email' ? 'email' : 'phone'
      const res: any   = await studentApi.sendOtp({ identifier, type, purpose, channel: ch })

      // Backend may auto-fallback. Use the channel reported by the server.
      const reported = (res?.channel ?? ch) as 'whatsapp' | 'email' | 'sms'
      setChannel(reported)
      setCountdown(600)
      toast.info(
        reported === 'email'
          ? 'OTP resent to your email.'
          : reported === 'sms'
            ? 'OTP resent via SMS.'
            : 'OTP resent to your WhatsApp.'
      )
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const mins = Math.floor(countdown / 60)
  const secs = String(countdown % 60).padStart(2, '0')
  const isEmail = channel === 'email'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-brand-600 text-3xl mb-3">
            {isEmail ? '📧' : '💬'}
          </div>
          <h1 className="text-xl font-bold">
            {isEmail ? 'Check your email' : 'Check your WhatsApp'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            We sent a 6-digit code to{' '}
            {isEmail
              ? <strong className="break-all">{email}</strong>
              : <strong>+91 {phone}</strong>}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex gap-2 justify-center mb-5">
            {code.map((c, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                value={c}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                maxLength={1}
                inputMode="numeric"
                pattern="\d"
                className="w-10 h-12 border-2 rounded-lg text-center text-xl font-bold focus:border-brand-500 focus:outline-none"
                disabled={loading}
              />
            ))}
          </div>

          <div className="text-center text-xs text-slate-500 mb-4">
            {countdown > 0 ? (
              <>Code expires in <strong className="font-mono">{mins}:{secs}</strong></>
            ) : (
              <span className="text-rose-500">Code expired. Resend below.</span>
            )}
          </div>

          {/* Resend buttons */}
          <div className="space-y-2">
            <button
              onClick={() => resend()}
              disabled={resending || countdown > 540}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {countdown > 540
                ? `Resend in ${Math.ceil((countdown - 540) / 60)} min`
                : `Resend OTP via ${isEmail ? 'Email' : 'WhatsApp'}`}
            </button>

            {/* Always offer the other channel as fallback */}
            {!isEmail && email && (
              <button
                onClick={() => resend('email')}
                disabled={resending}
                className="w-full flex items-center justify-center gap-2 border border-brand-200 bg-brand-50 text-brand-700 rounded-lg py-2 text-sm font-medium hover:bg-brand-100 disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                Send OTP to email instead
              </button>
            )}
            {isEmail && phone && (
              <button
                onClick={() => resend('whatsapp')}
                disabled={resending}
                className="w-full flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg py-2 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Send OTP to WhatsApp instead
              </button>
            )}
          </div>

          {loading && (
            <div className="mt-4 text-center text-sm text-brand-600 font-medium">
              Verifying…
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Didn't receive the code? Check spam folder. WhatsApp messages may take up to 30 seconds.
        </p>
      </div>
    </div>
  )
}
