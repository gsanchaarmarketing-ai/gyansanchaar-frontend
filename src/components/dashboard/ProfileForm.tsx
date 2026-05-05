'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/student-api'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name:        z.string().min(2, 'Minimum 2 characters'),
  father_name: z.string().min(2, "Father's name is required"),
  dob:         z.string().optional(),
  address:     z.string().min(5, 'Full address required'),
  city:        z.string().optional(),
  pincode:     z.string().optional(),
  state_id:    z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ProfileForm({ user, states }: { user: any; states: any[] }) {
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        user.name        ?? '',
      father_name: user.father_name ?? '',
      dob:         user.dob         ?? '',
      address:     user.address     ?? '',
      city:        user.city        ?? '',
      pincode:     user.pincode     ?? '',
      state_id:    user.state_id ? String(user.state_id) : '',
    },
  })

  async function onSubmit(values: Form) {
    setSaving(true)
    try {
      await updateProfile({
        ...values,
        state_id: values.state_id ? Number(values.state_id) : undefined,
      })
      setDone(true)
      toast.success('Profile saved!')
      // Give toast time to show then go back to dashboard
      setTimeout(() => router.push('/dashboard'), 900)
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inp = (err?: string) =>
    `w-full border-2 ${err ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Phone — read-only */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
        <div className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm bg-slate-50 text-slate-400">
          +91 {user.phone ?? '—'}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Cannot be changed after registration</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input {...register('name')} className={inp(errors.name?.message)} placeholder="As on marksheet" />
        {errors.name && <p className="text-xs text-rose-600 mt-1.5">{errors.name.message}</p>}
      </div>

      {/* Father's Name */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Father's Name <span className="text-rose-500">*</span>
        </label>
        <input {...register('father_name')} className={inp(errors.father_name?.message)} placeholder="Father's full name" />
        {errors.father_name && <p className="text-xs text-rose-600 mt-1.5">{errors.father_name.message}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
        <input type="date" {...register('dob')} className={inp()}
          max={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Complete Address <span className="text-rose-500">*</span>
        </label>
        <input {...register('address')} className={inp(errors.address?.message)} placeholder="House no., street, area" />
        {errors.address && <p className="text-xs text-rose-600 mt-1.5">{errors.address.message}</p>}
      </div>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
          <input {...register('city')} className={inp()} placeholder="City" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode</label>
          <input {...register('pincode')} className={inp()} placeholder="6-digit" maxLength={6} inputMode="numeric" />
        </div>
      </div>

      {/* State */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
        <select {...register('state_id')}
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white">
          <option value="">Select state</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <button type="submit" disabled={saving || done}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
        {done
          ? <><CheckCircle2 className="w-4 h-4" />Saved! Returning to dashboard…</>
          : saving
          ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
          : 'Save & Continue →'
        }
      </button>
    </form>
  )
}