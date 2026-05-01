'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Suspense } from 'react'

function LoginForm() {
  const sp         = useSearchParams()
  const redirectTo = sp.get('redirect') ?? '/dashboard'
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [error,   setError]   = useState('')

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    setError('')
    if (!email || !pwd) { setError('Email and password are required'); return }
    setLoading(true)
    try {
      const { error: authErr } = await createBrowserSupabaseClient()
        .auth.signInWithPassword({ email, password: pwd })
      if (authErr) throw authErr
      window.location.href = redirectTo
    } catch (e: any) {
      const msg = e.message ?? ''
      if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.')
      } else {
        setError(msg || 'Login failed. Please try again.')
      }
      setLoading(false)
    }
  }

  const inp = (hasErr: boolean) =>
    `w-full border ${hasErr ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors`

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-6">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-4">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-1">Log in to track your applications</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <form onSubmit={submit} className="space-y-4" noValidate>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              className={inp(!!error)} placeholder="you@email.com" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwd}
                onChange={e => { setPwd(e.target.value); setError('') }}
                className={inp(!!error)+' pr-11'} placeholder="Your password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Logging in…</>
              : 'Log in →'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            New to GyanSanchaar?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
