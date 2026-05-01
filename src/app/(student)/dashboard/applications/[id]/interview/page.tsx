'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { scheduleInterview } from '@/lib/student-api'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function InterviewPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const sb = createBrowserSupabaseClient()
  const [app, setApp] = useState<any>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    sb.from('applications')
      .select('id, status, interview_at, colleges(name), courses(name)')
      .eq('id', Number(params.id))
      .single()
      .then(({ data }) => setApp(data))
  }, [params.id])

  async function submit() {
    if (!date || !time) { toast.error('Pick date and time'); return }
    setSaving(true)
    try {
      const iso = new Date(`${date}T${time}:00`).toISOString()
      await scheduleInterview(Number(params.id), iso)
      toast.success('Interview scheduled!')
      router.push(`/dashboard/applications/${params.id}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally { setSaving(false) }
  }

  if (!app) return <><Header /><main className="max-w-md mx-auto px-4 py-10 text-center text-muted">Loading…</main></>

  const inp = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none'

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-5 pb-24">
        <Link href={`/dashboard/applications/${params.id}`} className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-heading">Schedule Interview</h1>
          </div>

          <p className="text-muted text-sm mb-5">
            <strong>{app.colleges?.name}</strong> · {app.courses?.name}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inp} />
            </div>
            <button onClick={submit} disabled={saving}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? 'Scheduling…' : 'Schedule Interview'}
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
