'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { register as registerUser } from '@/lib/student-api'
import { GraduationCap, Eye, EyeOff, Shield } from 'lucide-react'

const schema = z.object({
  name:     z.string().min(2, 'Min 2 characters'),
  email:    z.string().email('Invalid email'),
  phone:    z.string().regex(/^\d{10}$/, '10 digits required'),
  password: z.string().min(8, 'Min 8 characters'),
  confirm:  z.string(),
  dob:      z.string().optional(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    setLoading(true)
    try {
      await registerUser({
        name:           values.name,
        email:          values.email,
        phone:          values.phone,
        password:       values.password,
        dob:            values.dob,
        policy_version: '1.0',
      })
      toast.success('Account created! Check your email to verify.', { duration: 5000 })
      // Supabase sends confirmation email — redirect to verify page
      window.location.href = `/verify-otp?email=${encodeURIComponent(values.email)}&purpose=registration&channel=email`
    } catch (e: any) {
      toast.error(e.message ?? 'Registration failed')
      setLoading(false)
    }
  }

  const inp = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none'
  const lbl = 'block text-sm font-medium mb-1.5'

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-5">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-3">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Create your free account</h1>
        <p className="text-white/60 text-sm mt-1">Apply to colleges in 10 minutes. Always free.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={lbl}>Full Name</label>
            <input {...register('name')} className={inp} placeholder="As on marksheet" />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" {...register('email')} className={inp} />
            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className={lbl}>Phone (10 digits)</label>
            <input type="tel" {...register('phone')} className={inp} maxLength={10} placeholder="WhatsApp number" />
            {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className={lbl}>Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} {...register('password')} className={inp+' pr-10'} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className={lbl}>Confirm Password</label>
            <input type="password" {...register('confirm')} className={inp} />
            {errors.confirm && <p className="text-rose-600 text-xs mt-1">{errors.confirm.message}</p>}
          </div>
          <div>
            <label className={lbl}>Date of Birth <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="date" {...register('dob')} className={inp} />
          </div>

          <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
            <Shield className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500">
              By signing up, you agree to our{' '}
              <Link href="/privacy" className="text-brand-600">Privacy Policy</Link>. Your data is protected under the{' '}
              <strong>DPDP Act 2023</strong>. We never sell your data.
            </p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create account — Free'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Have an account? <Link href="/login" className="text-brand-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
