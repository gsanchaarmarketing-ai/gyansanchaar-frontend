'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { studentApi, publicApi } from '@/lib/api'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const sp = useSearchParams()
  const redirectTo = sp.get('redirect') ?? '/dashboard'

  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    setLoading(true)
    try {
      const res: any = await studentApi.login(values)

      // Set cookie via Next.js API route, then verify it succeeded
      const setRes = await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: res.token }),
      })
      if (!setRes.ok) throw new Error('Failed to set login session.')

      toast.success('Logged in!')

      // Warm up the backend before redirecting — guarantees the next request
      // (dashboard's me() call) lands on an awake server instead of triggering
      // a 10-15s cold start that could timeout and bounce user back to login.
      const target = res.requires_otp
        ? `/verify-otp?phone=${encodeURIComponent(res.user?.phone ?? '')}&purpose=login&channel=whatsapp`
        : redirectTo

      try { await publicApi.healthz() } catch {}

      // Hard navigation — guarantees the new cookie is sent on the next request
      // and the dashboard page renders fresh server-side. router.push() uses
      // Next.js cache and may render the pre-login version.
      window.location.href = target
    } catch (e: any) {
      const msg = e?.data?.message ?? e?.message ?? 'Login failed'
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-5">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-3">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-1">Log in to track applications and check status</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" {...register('email')}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              {errors.email && <p className="text-rose-600 text-xs mt-1">{(errors.email.message as string)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} {...register('password')}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-xs mt-1">{(errors.password.message as string)}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-medium">Sign up</Link>
          </p>
      </div>
    </div>
  )
}
