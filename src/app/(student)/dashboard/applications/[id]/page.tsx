import { redirect, notFound } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import WithdrawButton from '@/components/dashboard/WithdrawButton'
import InterviewCard from '@/components/dashboard/InterviewCard'
import AdmissionLetterCard from '@/components/dashboard/AdmissionLetterCard'
import { statusColor, statusLabel } from '@/lib/utils'
import { MapPin } from 'lucide-react'

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const token = await getToken()
  if (!token) redirect('/login')

  let app
  try {
    const r = await studentApi.application(token, Number(params.id))
    app = r.data
  } catch {
    notFound()
  }

  return (
    <>
      <Header isLoggedIn />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <div className="text-xs text-slate-500 mb-3">
          <a href="/dashboard/applications" className="hover:text-primary">← My Applications</a>
        </div>

        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold">{app.college.name}</h1>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {app.college.city}
              {app.college.state ? `, ${app.college.state.name}` : ''}
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor(app.status)}`}>
            {statusLabel(app.status)}
          </span>
        </div>

        {/* Admission letter — shown when status = admitted and letter is ready */}
        {app.status === 'admitted' && app.admission_letter_url && (
          <AdmissionLetterCard applicationId={app.id} token={token} />
        )}

        {/* Interview card — shown when status = interview_scheduled */}
        <InterviewCard application={app} />

        {/* Application details */}
        <div className="bg-white border border-border rounded-xl p-5 space-y-3 mb-4">
          {([
            ['Course', app.course.name],
            ['Level', app.course.level?.toUpperCase()],
            ['Branch', app.branch ?? '—'],
            ['Applied', new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>

        {/* Status history */}
        {Array.isArray((app as any).status_history) && (app as any).status_history.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-3">Status Timeline</h2>
            <ol className="space-y-3">
              {(app as any).status_history.map((h: any) => (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>{statusLabel(h.to_status)}</strong>
                    <div className="text-xs text-slate-500">
                      {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {h.note ? ` — ${h.note}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Withdraw */}
        {!['admitted', 'rejected', 'withdrawn'].includes(app.status) && (
          <div className="mt-4">
            <WithdrawButton applicationId={app.id} />
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
