'use client'

import { useState } from 'react'
import { logout } from '@/lib/actions'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await logout()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50"
      aria-label="Sign out"
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
