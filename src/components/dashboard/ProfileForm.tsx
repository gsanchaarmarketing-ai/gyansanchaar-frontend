'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/student-api'
import { useState } from 'react'

const schema = z.object({
  name:        z.string().min(2),
  father_name: z.string().optional(),
  dob:         z.string().optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  pincode:     z.string().optional(),
  state_id:    z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ProfileForm({ user, states }: { user: any; states: any[] }) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        user.name,
      father_name: user.father_name ?? '',
      dob:         user.dob ?? '',
      address:     user.address ?? '',
      city:        user.city ?? '',
      pincode:     user.pincode ?? '',
      state_id:    user.state_id ? String(user.state_id) : '',
    },
  })

  async function onSubmit(values: Form) {
    setSaving(true)
    try {
      await updateProfile({ ...values, state_id: values.state_id ? Number(values.state_id) : undefined })
      toast.success('Profile saved')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-xl p-5 space-y-4">

      {/* Phone — read-only, set at registration */}
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500">
          +91 {user.phone ?? '—'}
        </div>
        <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed after registration</p>
      </div>

      {([
        ['name',        'Full Name',      'text'],
        ['father_name', "Father's Name",  'text'],
        ['dob',         'Date of Birth',  'date'],
        ['address',     'Address',        'text'],
        ['city',        'City',           'text'],
        ['pincode',     'Pincode',        'text'],
      ] as [keyof Form, string, string][]).map(([n, l, t]) => (
        <div key={n}>
          <label className="block text-sm font-medium mb-1">{l}</label>
          <input type={t} {...register(n)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <select {...register('state_id')} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="">Select state</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <button type="submit" disabled={saving}
        className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 hover:bg-brand-700 transition-colors">
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}
