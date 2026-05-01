'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [err,     setErr]     = useState<Record<string,string>>({})
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', dob: ''
  })

  function f(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }))
      setErr(p => ({ ...p, [k]: '' }))
    }
  }

  function validate() {
    const e: Record<string,string> = {}
    if (form.name.length < 2)         e.name     = 'Min 2 characters'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g,''))) e.phone = '10-digit number required'
    if (form.password.length < 8)     e.password = 'Min 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErr(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const sb = createBrowserSupabaseClient()
      const phone = form.phone.replace(/\D/g, '').slice(-10)

      // Sign up — email confirm OFF, so user is immediately logged in
      const { data, error } = await sb.auth.signUp({
        email:    form.email,
        password: form.password,
        options:  { data: { name: form.name } },
      })
      if (error) throw error

      const uid = data.user?.id
      if (!uid) throw new Error('Registration failed. Please try again.')

      // Update profile with name and phone
      const isMinor = form.dob
        ? (new Date().getFullYear() - new Date(form.dob).getFullYear()) < 18
        : false

      await sb.from('profiles').update({
        name: form.name,
        phone,
        dob:            form.dob || null,
        is_minor:       isMinor,
        consent_at:     new Date().toISOString(),
        policy_version: '1.0',
      }).eq('id', uid)

      // Seed consent records
      await sb.from('consent_records').insert([
        { user_id: uid, purpose: 'application',   action: 'granted',   policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'communication', action: 'granted',   policy_version: '1.0', source: 'registration' },
        { user_id: uid, purpose: 'marketing',     action: 'withdrawn', policy_version: '1.0', source: 'registration' },
      ])

      toast.success(`Welcome ${form.name}! Complete your profile to start applying.`)

      // Go directly to dashboard — email confirmation is OFF in Supabase
      window.location.href = '/dashboard'
    } catch (e: any) {
      const msg = e.message ?? 'Registration failed'
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErr({ email: 'This email is already registered. Please log in.' })
      } else {
        toast.error(msg)
      }
      setLoading(false)
    }
  }

  const inp = (hasErr: boolean) =>
    `w-full border ${hasErr ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors`

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-6">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Create your free account</h1>
        <p className="text-white/60 text-sm mt-1">Apply to colleges in 10 minutes. Always ₹0.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <form onSubmit={submit} className="space-y-4" noValidate>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input value={form.name} onChange={f('name')} className={inp(!!err.name)}
              placeholder="As on marksheet" />
            {err.name && <p className="text-rose-600 text-xs mt-1">{err.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email ID <span className="text-rose-500">*</span>
            </label>
            <input type="email" value={form.email} onChange={f('email')} className={inp(!!err.email)}
              placeholder="you@email.com" />
            {err.email && <p className="text-rose-600 text-xs mt-1">{err.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              WhatsApp Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 shrink-0">
                🇮🇳 +91
              </div>
              <input type="tel" value={form.phone} onChange={f('phone')} className={inp(!!err.phone)+' flex-1'}
                placeholder="10-digit number" maxLength={10} inputMode="numeric" />
            </div>
            {err.phone && <p className="text-rose-600 text-xs mt-1">{err.phone}</p>}
            <p className="text-xs text-slate-400 mt-1">You'll receive application updates on WhatsApp</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={f('password')}
                className={inp(!!err.password)+' pr-11'} placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {err.password && <p className="text-rose-600 text-xs mt-1">{err.password}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input type="password" value={form.confirm} onChange={f('confirm')}
              className={inp(!!err.confirm)} placeholder="Repeat password" />
            {err.confirm && <p className="text-rose-600 text-xs mt-1">{err.confirm}</p>}
          </div>

          {/* DOB — optional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input type="date" value={form.dob} onChange={f('dob')} className={inp(false)}
              max={new Date().toISOString().split('T')[0]} />
          </div>

          {/* DPDP consent */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> and{' '}
              <Link href="/terms" className="text-blue-600 underline">Terms</Link>.
              Your data is protected under the <strong>DPDP Act 2023</strong>. We never sell your data.
            </p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</>
              : 'Create Free Account →'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {['100% Free', 'DPDP Compliant', 'UGC Verified Colleges'].map(b => (
            <div key={b} className="flex items-center gap-1 text-[10px] text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />{b}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
