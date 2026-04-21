'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  complainant_name: z.string().min(2, 'Required'),
  complainant_email: z.string().email('Invalid email'),
  complainant_phone: z.string().optional(),
  category: z.string().min(1, 'Select category'),
  subject: z.string().min(5, 'Min 5 characters'),
  description: z.string().min(20, 'Min 20 characters'),
})
type Form = z.infer<typeof schema>

const CATEGORIES = [
  ['data_privacy','Data Privacy'],['content_removal','Content Removal'],
  ['application_issue','Application Issue'],['harassment','Harassment'],
  ['refund','Refund'],['account_access','Account Access'],['other','Other'],
]

export default function GrievancePage() {
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    setLoading(true)
    try {
      const res = await studentApi.fileGrievance(values)
      setSubmitted(res.ticket_id)
    } catch (e: any) {
      toast.error(e.message ?? 'Submission failed')
    } finally { setLoading(false) }
  }

  if (submitted) return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Grievance Received</h1>
        <p className="text-slate-500 mb-4">Your ticket ID is <strong>{submitted}</strong>.</p>
        <p className="text-sm text-slate-600">We acknowledge within 24 hours and resolve within 15 days (IT Rules 2021).</p>
        <p className="text-sm text-slate-500 mt-3">
          Grievance Officer: <a href="mailto:grievance@gyansanchaar.cloud" className="text-brand-600">grievance@gyansanchaar.cloud</a>
        </p>
      </main>
      <MobileNav />
    </>
  )

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-10">
        <h1 className="text-2xl font-bold mb-1">File a Grievance</h1>
        <p className="text-slate-500 text-sm mb-6">We acknowledge within 24 hours and resolve within 15 days per IT Rules 2021.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-xl p-5 space-y-4">
          {[['complainant_name','Your Name','text'],['complainant_email','Email','email'],['complainant_phone','Phone (optional)','tel']].map(([n,l,t]) => (
            <div key={n}>
              <label className="block text-sm font-medium mb-1">{l}</label>
              <input type={t as any} {...register(n as any)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              {errors[n as keyof typeof errors] && <p className="text-rose-600 text-xs mt-1">{String(errors[n as keyof typeof errors]?.message ?? '')}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register('category')} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select…</option>
              {CATEGORIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {errors.category && <p className="text-rose-600 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input type="text" {...register('subject')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            {errors.subject && <p className="text-rose-600 text-xs mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={5} {...register('description')} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
            {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
            {loading ? 'Submitting…' : 'Submit Grievance'}
          </button>
        </form>
      </main>
      <MobileNav />
    </>
  )
}
