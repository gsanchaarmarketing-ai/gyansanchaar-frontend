import { getClientToken } from '@/lib/client-auth'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { studentApi, type Course } from '@/lib/api'
import { toast } from 'sonner'

interface Props { collegeId: number; collegeName: string; courses: Course[] }

export default function ApplyButton({ collegeId, collegeName, courses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(false)

  async function apply() {
    if (!selectedCourse) { toast.error('Please select a course'); return }
    setLoading(true)
    try {
      const token = await getClientToken()
      if (!token) { router.push('/login'); return }
      await studentApi.applyToCollege(token, { college_id: collegeId, course_id: Number(selectedCourse) })
      toast.success(`Applied to ${collegeName}!`)
      router.push('/dashboard/applications')
    } catch (e: any) {
      if (e.status === 401) router.push('/login')
      else if (e.status === 403 && e.data?.code === 'PARENTAL_CONSENT_REQUIRED')
        router.push('/dashboard/parental-consent')
      else toast.error(e.message ?? 'Apply failed')
    } finally { setLoading(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full bg-white text-brand-700 font-semibold py-2 rounded-lg hover:bg-brand-50 transition-colors">
      Apply Now
    </button>
  )

  return (
    <div className="space-y-3">
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-slate-900 text-sm border-0">
        <option value="">Select course…</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level?.toUpperCase()})</option>)}
      </select>
      <button onClick={apply} disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-2 rounded-lg transition-colors disabled:opacity-60">
        {loading ? 'Applying…' : 'Confirm Application'}
      </button>
      <button onClick={() => setOpen(false)} className="w-full text-brand-200 text-xs py-1">Cancel</button>
    </div>
  )
}
