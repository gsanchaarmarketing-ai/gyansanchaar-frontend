'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/HeaderClient'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, Clock, MessageCircle, X, RotateCw, CheckCircle2, ArrowLeft } from 'lucide-react'

import { getClientToken } from '@/lib/client-auth'
import { studentApi } from '@/lib/api'


const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
]

export default function CounsellingPage() {
  const params  = useSearchParams()
  const router  = useRouter()
  const appId   = params.get('application_id')

  const [applications, setApplications] = useState<any[]>([])
  const [sessions,     setSessions]     = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [booking,      setBooking]      = useState(false)

  // Booking form state
  const [selectedApp,  setSelectedApp]  = useState(appId ?? '')
  const [date,         setDate]         = useState('')
  const [startTime,    setStartTime]    = useState('')
  const [notes,        setNotes]        = useState('')
  const [consent,      setConsent]      = useState(false)
  const [showForm,     setShowForm]     = useState(!!appId)

  useEffect(() => {
    getClientToken().then(token => {
      if (!token) { router.push('/login'); return }

      Promise.all([
        studentApi.applications(token),
        fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'}/student/counselling`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' }),
      ]).then(async ([appsData, c]) => {
        const sessData = await c.json()
        setApplications((appsData.data ?? []).filter((a: any) => ['applied','approved','interview_scheduled'].includes(a.status)))
        setSessions(sessData.data ?? [])
      }).finally(() => setLoading(false))
    })
  }, [router])

  async function bookSession() {
    if (!selectedApp || !date || !startTime || !consent) {
      alert('Please fill all required fields and accept consent.'); return
    }
    const endTime = TIME_SLOTS[TIME_SLOTS.indexOf(startTime) + 1] ?? '18:00'
    setBooking(true)
    const token = await getClientToken()
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'
      const res = await fetch(`${apiBase}/student/counselling`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          application_id:       Number(selectedApp),
          date,
          start_time:           startTime,
          end_time:             endTime,
          student_notes:        notes,
          data_sharing_consent: true,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSessions(p => [data.data, ...p])
        setShowForm(false)
        setDate(''); setStartTime(''); setNotes(''); setConsent(false)
        alert('✅ Counselling session booked! We will confirm the slot shortly.')
      } else {
        alert(data.message ?? 'Booking failed')
      }
    } catch { alert('Network error. Try again.') }
    finally { setBooking(false) }
  }

  async function cancelSession(id: number) {
    if (!confirm('Cancel this counselling session?')) return
    const token = await getClientToken()
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'
    await fetch(`${apiBase}/student/counselling/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ reason: 'Cancelled by student' }),
    })
    setSessions(p => p.map(s => s.id === id ? { ...s, status: 'cancelled' } : s))
  }

  const statusColor: Record<string,string> = {
    scheduled:   'bg-blue-100 text-blue-800',
    completed:   'bg-green-100 text-green-800',
    cancelled:   'bg-rose-100 text-rose-800',
    rescheduled: 'bg-amber-100 text-amber-800',
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted text-sm mb-5 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-heading">Counselling Sessions</h1>
            <p className="text-muted text-sm">Speak directly with a college counsellor after applying</p>
          </div>
          {applications.length > 0 && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold">
              <MessageCircle className="w-4 h-4" /> Book Session
            </button>
          )}
        </div>

        {/* Booking form */}
        {showForm && (
          <div className="bg-white border border-border rounded-2xl p-5 mb-6 space-y-4">
            <h2 className="font-bold text-heading">Book a counselling session</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Select College Application <span className="text-rose-500">*</span></label>
              <select value={selectedApp} onChange={e => setSelectedApp(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm">
                <option value="">Choose an application…</option>
                {applications.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.college?.name} — {a.course?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preferred Date <span className="text-rose-500">*</span></label>
              <input type="date" value={date} min={minDateStr} onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preferred Time (IST) <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.slice(0, -1).map(t => (
                  <button key={t} type="button" onClick={() => setStartTime(t)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      startTime === t ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary text-body'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">What do you want to discuss? (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="e.g., Fee structure, hostel facilities, scholarship options, campus life..."
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm resize-none" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted leading-relaxed">
                I consent to sharing my profile information (name, phone, course interest) with the college counsellor for this session. 
                <a href="/privacy" className="text-primary underline ml-1" target="_blank">Privacy Policy</a>
              </span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-border py-2.5 rounded-xl text-sm text-body">
                Cancel
              </button>
              <button onClick={bookSession} disabled={booking || !selectedApp || !date || !startTime || !consent}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
                {booking ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>

            {applications.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                You need to apply to a college before booking a counselling session.
                <Link href="/colleges" className="text-primary font-semibold ml-2">Browse Colleges →</Link>
              </div>
            )}
          </div>
        )}

        {/* Sessions list */}
        {loading ? (
          <div className="text-center text-muted py-12">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-10 text-center">
            <MessageCircle className="w-10 h-10 text-muted mx-auto mb-3" />
            <div className="font-semibold text-heading mb-1">No counselling sessions yet</div>
            <p className="text-muted text-sm mb-4">Apply to a college first, then book a free session with their counsellor.</p>
            {applications.length > 0 && (
              <button onClick={() => setShowForm(true)}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                Book your first session
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <div key={s.id} className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-heading">{s.college?.name ?? 'College'}</div>
                    <div className="flex items-center gap-3 mt-1 text-muted text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {s.date ? new Date(s.date).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'}) : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)} IST
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {s.status === 'scheduled' ? '⏳ Pending confirmation' : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>

                {s.student_notes && (
                  <p className="text-body text-xs bg-slate-50 rounded-lg p-3 mb-3">{s.student_notes}</p>
                )}

                {s.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button onClick={() => cancelSession(s.id)}
                      className="flex items-center gap-1.5 text-xs text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
