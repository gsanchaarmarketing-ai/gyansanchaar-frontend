'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { studentApi } from '@/lib/api'
import { toast } from 'sonner'
import { GraduationCap } from 'lucide-react'

export default function VerifyOtpPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const phone = sp.get('phone') ?? ''
  const purpose = sp.get('purpose') ?? 'registration'
  const [code, setCode] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
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
      const res = await studentApi.verifyOtp({ identifier: phone, purpose, code: otp })
      if (res.token) {
        await fetch('/api/auth/set-token', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ token: res.token }),
        })
      }
      toast.success('Phone verified!')
      router.push('/dashboard')
    } catch (e: any) {
      toast.error(e.message ?? 'Invalid OTP')
      setCode(['','','','','',''])
      inputRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  async function resend() {
    try {
      await studentApi.sendOtp({ identifier: phone, type: 'phone', purpose, channel: 'whatsapp' })
      setCountdown(600)
      toast.info('OTP resent to WhatsApp')
    } catch (e: any) { toast.error(e.message) }
  }

  const mins = Math.floor(countdown / 60)
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-brand-600 text-3xl mb-3">💬</div>
          <h1 className="text-xl font-bold">Check your WhatsApp</h1>
          <p className="text-slate-500 text-sm mt-1">
            We sent a 6-digit code to <strong>+91 {phone}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex gap-2 justify-center mb-5">
            {code.map((c, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                maxLength={1}
                value={c}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                disabled={loading}
                className="w-12 h-14 text-2xl font-bold text-center border-2 rounded-xl focus:border-brand-500 outline-none transition-colors"
              />
            ))}
          </div>

          {countdown > 0 ? (
            <p className="text-center text-sm text-slate-500">Code expires in {mins}:{secs}</p>
          ) : (
            <button onClick={resend} className="w-full text-brand-600 text-sm font-medium">
              Resend code
            </button>
          )}

          <p className="text-xs text-slate-400 text-center mt-3">
            Sent to WhatsApp. Didn't get it?{' '}
            <button onClick={resend} className="text-brand-600">Send again</button>
          </p>
        </div>
      </div>
    </div>
  )
}
