'use client'
import { useState } from 'react'
import { requestErasure } from '@/lib/student-api'
import { toast } from 'sonner'

export default function ErasureButton() {
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!confirm('Are you sure? This will erase ALL your data within 30 days. This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await requestErasure()
      toast.success(`Erasure requested. Ticket: ${res.ticket_id}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={handle} disabled={loading}
      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
      {loading ? 'Submitting…' : 'Request data erasure'}
    </button>
  )
}
