'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { studentApi, type User, type State } from '@/lib/api'
import { useState } from 'react'
import { CheckCircle2, ShieldAlert, MessageCircle, X } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  father_name: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state_id: z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ProfileForm({ user, states, token }: { user: User; states: State[]; token: string }) {
  const [saving, setSaving] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(!!user.phone_verified_at)

  const { register, handleSubmit, formState:{errors} } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name, father_name: user.father_name ?? '', dob: user.dob ?? '',
      address: user.address ?? '', city: user.city ?? '',
      pincode: '', state_id: user.state_id ? String(user.state_id) : '',
    },
  })

  async function onSubmit(values: Form) {
    setSaving(true)
    try {
      await studentApi.updateProfile(token, { ...values, state_id: values.state_id ? Number(values.state_id) : undefined })
      toast.success('Profile saved')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-xl p-5 space-y-4">
      {/* Phone verification widget */}
      <PhoneVerificationBlock
        phone={user.phone}
        verified={phoneVerified}
        onVerified={() => setPhoneVerified(true)}
      />

      {[['name','Full Name','text'],['father_name',"Father's Name",'text'],['dob','Date of Birth','date'],['address','Address','text'],['city','City','text'],['pincode','Pincode','text']].map(([n,l,t])=>(
        <div key={n}>
          <label className="block text-sm font-medium mb-1">{l}</label>
          <input type={t as string} {...register(n as keyof Form)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <select {...register('state_id')} className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">Select state</option>
          {states.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <button type="submit" disabled={saving}
        className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}

/**
 * Phone verification widget. Shows verified badge if already verified,
 * otherwise shows "Verify Now" button → OTP input → calls phone_verification
 * purpose endpoint via WhatsApp.
 */
function PhoneVerificationBlock({
  phone, verified, onVerified,
}: { phone: string; verified: boolean; onVerified: () => void }) {
  const [stage, setStage] = useState<'idle' | 'sending' | 'otp' | 'verifying'>('idle')
  const [code, setCode] = useState('')

  if (verified) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-emerald-800">
          Phone <strong>+91 {phone}</strong> is verified.
        </span>
      </div>
    )
  }

  async function sendOtp() {
    setStage('sending')
    try {
      await studentApi.sendOtp({
        identifier: phone,
        type: 'phone',
        purpose: 'phone_verification',
        channel: 'whatsapp',
      })
      toast.success('OTP sent to your WhatsApp')
      setStage('otp')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to send OTP')
      setStage('idle')
    }
  }

  async function verify() {
    if (code.length !== 6) { toast.error('Enter 6-digit code'); return }
    setStage('verifying')
    try {
      await studentApi.verifyOtp({ identifier: phone, purpose: 'phone_verification', code })
      toast.success('Phone verified!')
      onVerified()
    } catch (e: any) {
      toast.error(e?.message ?? 'Invalid OTP')
      setStage('otp')
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm space-y-3">
      <div className="flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-amber-900">Verify your phone number</div>
          <div className="text-xs text-amber-700 mt-0.5">
            +91 {phone} — required for application status updates via WhatsApp
          </div>
        </div>
      </div>

      {stage === 'idle' && (
        <button type="button" onClick={sendOtp}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Verify via WhatsApp
        </button>
      )}

      {stage === 'sending' && (
        <button type="button" disabled
          className="w-full bg-emerald-600 text-white text-sm font-semibold py-2 rounded-lg opacity-60">
          Sending OTP…
        </button>
      )}

      {(stage === 'otp' || stage === 'verifying') && (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit OTP"
            className="w-full border-2 rounded-lg px-3 py-2.5 text-center text-lg font-mono font-bold tracking-widest focus:border-emerald-500 outline-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={verify} disabled={stage === 'verifying' || code.length !== 6}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50">
              {stage === 'verifying' ? 'Verifying…' : 'Verify'}
            </button>
            <button type="button" onClick={() => { setStage('idle'); setCode('') }}
              className="px-3 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={sendOtp}
            className="text-xs text-amber-700 hover:underline w-full text-center pt-1">
            Resend OTP
          </button>
        </div>
      )}
    </div>
  )
}
