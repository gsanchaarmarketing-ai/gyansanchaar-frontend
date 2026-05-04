'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X, AlertTriangle } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function DeleteStudentButton({
  id,
  name,
  redirect,
}: {
  id: string
  name: string
  redirect?: string
}) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Delete failed')
      }
      setOpen(false)
      router.push(redirect ?? '/admin/students')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Delete student?</h3>
                <p className="text-white/40 text-sm mt-1">
                  This will permanently delete <strong className="text-white/70">{name}</strong> and all their data — applications, profile, and auth account. This cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-xs mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setError('') }}
                className="flex-1 border border-white/10 text-white/50 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
              >
                {loading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
