'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/HeaderClient'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import { getClientToken } from '@/lib/client-auth'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'

const SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30']

export default function ScheduleInterviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getClientToken().then(async token => {
      if (!token) { router.push('/login'); return }
      const res = await fetch(`${API}/student/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      })
      const data = await res.json()
      setApp(data.data)
      setLoading(false)
    })
  }, [id, router])

  async function schedule() {
    if (!date || !time) { alert('Select date and time'); return }
    setSaving(true)
    const token = await getClientToken()
    try {
      const res = await fetch(`${API}/student/applications/${id}/interview`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ interview_at: `${date}T${time}:00` }),
      })
      const data = await res.json()
      if (res.ok) {
        alert('Interview scheduled! You will receive a WhatsApp confirmation.')
        router.push('/dashboard')
      } else {
        alert(data.message ?? 'Failed to schedule')
      }
    } catch { alert('Network error. Try again.') }
    finally { setSaving(false) }
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
          <div className="text-muted text-sm">Loading…</div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 text-primary" />
                Select Date <span className="text-rose-500">*</span>
              </label>
              <input type="date" value={date} min={minDateStr}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1.5 text-primary" />
                Select Time (IST) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SLOTS.map(t => (
                  <button key={t} type="button" onClick={() => setTime(t)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      time === t ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary text-body'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary-light rounded-xl p-4 text-xs text-body">
              <strong>Note:</strong> The college will confirm your interview slot via WhatsApp. 
              Please ensure your phone number is correct in your profile.
            </div>

            <button onClick={schedule} disabled={saving || !date || !time}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
              {saving ? 'Scheduling…' : 'Confirm Interview →'}
            </button>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
