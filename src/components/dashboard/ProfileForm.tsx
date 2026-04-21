'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { studentApi, type User, type State } from '@/lib/api'
import { useState } from 'react'

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
      {/* Verified phone badge */}
      <div className="bg-slate-50 rounded-lg p-3 text-sm">
        <span className="text-slate-500">Phone (verified):</span> <strong>{user.phone}</strong>{' '}
        {user.phone_verified_at && <span className="text-emerald-600 text-xs">✓ Verified</span>}
      </div>

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
