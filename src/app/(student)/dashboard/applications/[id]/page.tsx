import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { ArrowLeft, Calendar, Download } from 'lucide-react'
import { statusColor, statusLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: app } = await sb.from('applications').select(`
    *, colleges(*, states(name)), courses(*),
    application_status_histories(id, from_status, to_status, note, created_at)
  `).eq('id', Number(params.id)).eq('student_id', user.id).is('deleted_at', null).single()

  if (!app) notFound()

  const history = (app.application_status_histories ?? []).sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-10">
        <Link href="/dashboard/applications" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <div className="bg-white border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-lg font-bold text-heading">{app.colleges?.name}</h1>
              <p className="text-muted text-sm">{app.courses?.name} · {app.branch ?? app.courses?.level?.toUpperCase()}</p>
              <p className="text-muted text-xs mt-1">{app.colleges?.city}{app.colleges?.states?.name ? `, ${app.colleges.states.name}` : ''}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(app.status)}`}>
              {statusLabel(app.status)}
            </span>
          </div>

          {app.admission_letter_path && (
            <a href={app.admission_letter_path} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-2 rounded-lg text-sm font-semibold mt-3">
              <Download className="w-4 h-4" /> Download Admission Letter
            </a>
          )}

          {app.status === 'approved' && !app.interview_at && (
            <Link href={`/dashboard/applications/${app.id}/interview`}
              className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold mt-3">
              <Calendar className="w-4 h-4" /> Schedule Interview
            </Link>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-bold text-heading mb-3">Status Timeline</h2>
          <div className="space-y-3">
            {history.map((h: any) => (
              <div key={h.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-heading">{statusLabel(h.to_status)}</div>
                  {h.note && <div className="text-muted text-xs mt-0.5">{h.note}</div>}
                  <div className="text-muted text-xs mt-0.5">{new Date(h.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
