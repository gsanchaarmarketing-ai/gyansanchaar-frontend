'use client'
import { getClientToken } from '@/lib/client-auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { studentApi } from '@/lib/api'
import { toast } from 'sonner'

export default function WithdrawButton({ applicationId }: { applicationId: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function withdraw() {
    setLoading(true)
    try {
      const token = await getClientToken() ?? ''
      await studentApi.withdrawApplication(token, applicationId)
      toast.success('Application withdrawn')
      router.refresh()
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false); setConfirming(false) }
  }

  if (!confirming) return (
    <button onClick={() => setConfirming(true)}
      className="w-full border border-rose-300 text-rose-600 py-2.5 rounded-xl text-sm hover:bg-rose-50 transition-colors">
      Withdraw Application
    </button>
  )
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
      <p className="text-sm font-medium text-rose-800 mb-3">Are you sure you want to withdraw this application? This cannot be undone.</p>
      <div className="flex gap-2">
        <button onClick={() => setConfirming(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
        <button onClick={withdraw} disabled={loading} className="flex-1 bg-rose-600 text-white py-2 rounded-lg text-sm disabled:opacity-60">
          {loading ? 'Withdrawing…' : 'Yes, Withdraw'}
        </button>
      </div>
    </div>
  )
}
