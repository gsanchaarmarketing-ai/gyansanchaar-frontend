import { redirect, notFound } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import WithdrawButton from '@/components/dashboard/WithdrawButton'
import { statusColor, statusLabel } from '@/lib/utils'
import { MapPin, Calendar, Download } from 'lucide-react'

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const token = await getToken()
  if (!token) redirect('/login')
  let app
  try { const r = await studentApi.application(token, Number(params.id)); app = r.data }
  catch { notFound() }

  return (
    <>
      <Header isLoggedIn />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <div className="text-xs text-slate-500 mb-3"><a href="/dashboard/applications" className="hover:text-brand-600">← My Applications</a></div>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold">{app.college.name}</h1>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5" />{app.college.city}{app.college.state ? `, ${app.college.state.name}` : ''}
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor(app.status)}`}>
            {statusLabel(app.status)}
          </span>
        </div>

        {/* Details */}
        <div className="bg-white border rounded-xl p-5 space-y-3 mb-4">
          {[['Course', app.course.name],['Level', app.course.level?.toUpperCase()],['Branch', app.branch ?? '—'],['Applied', new Date(app.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})]].map(([k,v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          {app.interview_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Interview</span>
              <strong className="text-purple-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(app.interview_at).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
              </strong>
            </div>
          )}
        </div>

        {/* Admission letter */}
        {app.admission_letter_path && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-emerald-800 text-sm">🎉 Admission Letter Ready</div>
              <div className="text-xs text-emerald-700 mt-0.5">Your admission letter is available for download</div>
            </div>
            <a href={`/api/download/letter?id=${app.id}`}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
              <Download className="w-4 h-4" />Download
            </a>
          </div>
        )}

        {/* Status history */}
        {(app as any).status_history?.length > 0 && (
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-3">Status Timeline</h2>
            <ol className="space-y-3">
              {(app as any).status_history.map((h: any) => (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>{statusLabel(h.to_status)}</strong>
                    <div className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} {h.note ? `— ${h.note}` : ''}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Withdraw */}
        {!['admitted','rejected','withdrawn'].includes(app.status) && (
          <div className="mt-4">
            <WithdrawButton applicationId={app.id} />
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
