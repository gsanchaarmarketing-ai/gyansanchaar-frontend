'use client'
import { useState } from 'react'
import { studentApi } from '@/lib/api'
import { toast } from 'sonner'

export default function ErasureButton({ token }: { token: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function requestErasure() {
    setLoading(true)
    try {
      const r = await studentApi.requestErasure(token)
      setDone(true)
      toast.success(`Erasure request filed. Ticket: ${r.ticket_id}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  if (done) return <p className="text-sm text-rose-700 font-medium">✓ Erasure request received. You will get a 48-hour advance notice email.</p>
  if (!confirming) return (
    <button onClick={() => setConfirming(true)}
      className="w-full border border-rose-400 text-rose-700 py-2 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">
      Request Account Deletion
    </button>
  )
  return (
    <div className="space-y-3">
      <p className="text-xs text-rose-800 font-semibold">This will permanently delete your account and application data (subject to retention obligations). Are you sure?</p>
      <div className="flex gap-2">
        <button onClick={() => setConfirming(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
        <button onClick={requestErasure} disabled={loading}
          className="flex-1 bg-rose-600 text-white py-2 rounded-lg text-sm disabled:opacity-60">
          {loading ? 'Requesting…' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  )
}
