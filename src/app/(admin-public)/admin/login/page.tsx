'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

export default function AdminLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const sb = createBrowserSupabaseClient()

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }

    // Verify admin role
    const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user.id).single()
    if (!profile || !['admin','super_admin','dpo','grievance_officer'].includes(profile.role)) {
      await sb.auth.signOut()
      toast.error('Access denied. Admin accounts only.')
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <Toaster theme="dark" position="top-right" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">GyanSanchaar</span>
          </div>
          <div className="text-white/30 text-[9px] uppercase tracking-widest">Admin Console</div>
        </div>

        <form onSubmit={handleLogin}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="admin@gyansanchaar.com" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
