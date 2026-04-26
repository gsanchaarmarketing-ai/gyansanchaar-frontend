'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/HeaderClient'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getClientToken } from '@/lib/client-auth'
import { studentApi } from '@/lib/api'

const SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
]

export default function ScheduleInterviewPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [date,  setDate]  = useState('')
  const [time,  setTime]  = useState('')
  const [app,   setApp]   = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    getClientToken().then(async token => {
      if (!token) { router.push('/login'); return }
      try {
        const res = await studentApi.application(token, Number(id))
        setApp(res.data)
      } catch { router.push('/dashboard/applications') }
      finally { setLoading(false) }
    })
  }, [id, router])

  async function schedule() {
    if (!date || !time) { alert('Please select both date and time.'); return }
    setSaving(true)
    try {
      const token = await getClientToken()
      if (!token) { router.push('/login'); return }
      await studentApi.scheduleInterview(token, Number(id), `${date}T${time}:00`)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (e: any) {
      alert(e?.message ?? 'Failed to schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6 pb-28">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-xl font-bold text-heading mb-1">Schedule Personal Interview</h1>
        {app && (
          <p className="text-muted text-sm mb-6">
            {app.college?.name} — {app.course?.name}
          </p>
        )}

        {loading ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : success ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="font-bold text-heading mb-1">Interview Scheduled!</h2>
            <p className="text-muted text-sm">
              {new Date(`${date}T${time}`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {time} IST
            </p>
            <p className="text-xs text-muted mt-3">You will receive a WhatsApp confirmation shortly. Redirecting…</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 text-primary" />
                Select Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={minDateStr}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1.5 text-primary" />
                Select Time (IST) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      time === t
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:border-primary text-body'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary-light rounded-xl p-4 text-xs text-body">
              <strong className="text-heading">Important:</strong> The college will confirm your interview slot via WhatsApp.
              Please ensure your phone number is verified in your profile.
            </div>

            <button
              onClick={schedule}
              disabled={saving || !date || !time}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary-hover transition-colors"
            >
              {saving ? 'Scheduling…' : 'Confirm Interview →'}
            </button>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
