'use client'
import { getClientToken } from '@/lib/client-auth'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { studentApi } from '@/lib/api'
import { CheckCircle } from 'lucide-react'

const schema1 = z.object({
  parent_name: z.string().min(2, 'Required'),
  parent_relationship: z.enum(['father','mother','guardian']),
  parent_phone: z.string().regex(/^\d{10}$/, '10-digit number'),
  parent_email: z.string().email().optional().or(z.literal('')),
})
type Form1 = z.infer<typeof schema1>

async function getToken() { return getClientToken() }

export default function ParentalConsentFlow({ token, existingParent }: { token: string; existingParent: any }) {
  const router = useRouter()
  const [step, setStep] = useState<'form'|'otp'|'done'>(existingParent ? 'otp' : 'form')
  const [maskedPhone, setMaskedPhone] = useState(existingParent ? '***' + String(existingParent.parent_name).slice(-4) : '')
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)

  const { register, handleSubmit, formState:{errors} } = useForm<Form1>({ resolver: zodResolver(schema1) })

  async function onInitiate(values: Form1) {
    try {
      const r = await studentApi.initiateParentalConsent(token, values)
      setMaskedPhone(r.parent_phone_masked)
      toast.success("OTP sent to parent's WhatsApp")
      setStep('otp')
    } catch (e: any) { toast.error(e.message) }
  }

  async function onVerify() {
    if (otp.length < 6) { toast.error('Enter 6-digit OTP'); return }
    setVerifying(true)
    try {
      await studentApi.verifyParentalConsent(token, otp)
      setStep('done')
      toast.success('Parent verified! You can now submit applications.')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (e: any) { toast.error(e.message) }
    finally { setVerifying(false) }
  }

  if (step === 'done') return (
    <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center">
      <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
      <h2 className="font-bold text-lg">Parent Verified!</h2>
      <p className="text-slate-500 text-sm mt-1">Redirecting you to the dashboard…</p>
    </div>
  )

  if (step === 'otp') return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <h2 className="font-semibold">Enter OTP</h2>
      <p className="text-sm text-slate-600">We sent a 6-digit code to your parent's WhatsApp <strong>{maskedPhone}</strong>. Ask them to share it with you.</p>
      <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
        placeholder="6-digit OTP" className="w-full border rounded-lg px-4 py-3 text-center text-xl font-bold tracking-widest" />
      <button onClick={onVerify} disabled={verifying || otp.length < 6}
        className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60">
        {verifying ? 'Verifying…' : 'Verify'}
      </button>
      <button onClick={() => setStep('form')} className="w-full text-slate-500 text-sm">← Change parent details</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onInitiate)} className="bg-white border rounded-xl p-5 space-y-4">
      <h2 className="font-semibold">Parent / Guardian Details</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Relationship</label>
        <select {...register('parent_relationship')} className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="guardian">Guardian</option>
        </select>
      </div>
      {[['parent_name',"Parent's Full Name",'text'],['parent_phone',"Parent's WhatsApp Number (10 digits)",'tel'],['parent_email',"Parent's Email (optional)",'email']].map(([n,l,t])=>(
        <div key={n}>
          <label className="block text-sm font-medium mb-1">{l}</label>
          <input type={t as string} {...register(n as keyof Form1)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors[n as keyof typeof errors] && <p className="text-rose-600 text-xs mt-1">{String(errors[n as keyof typeof errors]?.message ?? '')}</p>}
        </div>
      ))}
      <p className="text-xs text-slate-500">
        Your parent will receive a WhatsApp OTP. No application data is shared without their consent.
        We process this per <a href="/privacy" className="underline text-brand-600" target="_blank">Privacy Policy</a>.
      </p>
      <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold text-sm">
        Send OTP to Parent's WhatsApp
      </button>
    </form>
  )
}
