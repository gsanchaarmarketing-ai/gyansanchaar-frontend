'use client'
import { useState } from 'react'
import { withdrawApplication } from '@/lib/student-api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function WithdrawButton({ applicationId }: { applicationId: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle() {
    if (!confirm('Withdraw this application? You can re-apply later.')) return
    setLoading(true)
    try {
      await withdrawApplication(applicationId)
      toast.success('Application withdrawn')
      router.refresh()
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={handle} disabled={loading}
      className="text-rose-600 text-xs font-semibold hover:underline disabled:opacity-60">
      {loading ? 'Withdrawing…' : 'Withdraw application'}
    </button>
  )
}
