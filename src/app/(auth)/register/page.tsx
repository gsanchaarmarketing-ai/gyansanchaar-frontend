'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { studentApi } from '@/lib/api'
import { GraduationCap } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Enter 10-digit mobile number'),
  password: z.string().min(8, 'Min 8 characters'),
  password_confirmation: z.string(),
  dob: z.string().optional(),
  consent_application: z.literal(true, { errorMap: () => ({ message: 'Required to use GyanSanchaar' }) }),
  consent_communication: z.literal(true, { errorMap: () => ({ message: 'Required to use GyanSanchaar' }) }),
  consent_marketing: z.boolean().optional(),
  consent_analytics: z.boolean().optional(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match', path: ['password_confirmation'],
})

type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    setLoading(true)
    try {
      const res = await studentApi.register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        password_confirmation: values.password_confirmation,
        dob: values.dob,
        consents: {
          application: values.consent_application,
          communication: values.consent_communication,
          marketing: values.consent_marketing ?? false,
          analytics: values.consent_analytics ?? false,
        },
        policy_version: '1.0',
      })
      toast.success('Registered! Verify your phone now.')
      router.push(`/verify-otp?phone=${encodeURIComponent(values.phone)}&purpose=registration&user_id=${res.user?.id}`)
    } catch (e: any) {
      toast.error(e.message ?? 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-600 text-xl font-bold">
            <GraduationCap className="w-7 h-7" />GyanSanchaar
          </Link>
          <p className="text-slate-500 text-sm mt-1">Create your free account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {([['name','Full Name','text'],['email','Email','email'],['phone','Phone (10 digits)','tel'],['password','Password','password'],['password_confirmation','Confirm Password','password'],['dob','Date of Birth (optional)','date']] as const).map(([n,l,t]) => (
              <div key={n}>
                <label className="block text-sm font-medium mb-1">{l}</label>
                <input type={t} {...register(n as any)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                {errors[n as keyof typeof errors] && <p className="text-rose-600 text-xs mt-1">{String(errors[n as keyof typeof errors]?.message ?? '')}</p>}
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-medium text-slate-700">Consent (required to use GyanSanchaar)</p>
              {[
                { name: 'consent_application', label: 'Process my applications to colleges', required: true },
                { name: 'consent_communication', label: 'Send me status updates on WhatsApp & email', required: true },
                { name: 'consent_marketing', label: 'Send college recommendations (optional)', required: false },
                { name: 'consent_analytics', label: 'Help improve the platform anonymously (optional)', required: false },
              ].map(c => (
                <label key={c.name} className="flex items-start gap-2 text-xs cursor-pointer">
                  <input type="checkbox" {...register(c.name as any)} className="mt-0.5 rounded" />
                  <span className="text-slate-600">{c.label}</span>
                  {c.required && <span className="text-rose-500 ml-auto">*</span>}
                </label>
              ))}
              {(errors.consent_application || errors.consent_communication) && (
                <p className="text-rose-600 text-xs">Required consents must be accepted</p>
              )}
            </div>

            <p className="text-xs text-slate-500">
              By registering, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Have an account? <Link href="/login" className="text-brand-600 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
