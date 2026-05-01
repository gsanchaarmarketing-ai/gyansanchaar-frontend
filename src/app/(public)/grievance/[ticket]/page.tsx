import type { Metadata } from 'next'
import { getGrievanceStatus } from '@/lib/student-api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Grievance Status | GyanSanchaar' }

export default async function GrievanceStatusPage({ params }: { params: { ticket: string } }) {
  const status = await getGrievanceStatus(params.ticket)

  if (!status) return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Ticket Not Found</h1>
        <p className="text-slate-500 text-sm">Ticket <strong>{params.ticket}</strong> was not found.</p>
      </main>
      <MobileNav />
    </>
  )

  const resolved = ['resolved','rejected'].includes(status.status)

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-center mb-5">
            {resolved
              ? <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              : <Clock className="w-12 h-12 text-brand-500 mx-auto" />}
          </div>
          <h1 className="text-xl font-bold text-center mb-4">Grievance Status</h1>
          <dl className="space-y-3 text-sm">
            {[
              ['Ticket ID',  status.ticket_id],
              ['Category',   status.category],
              ['Status',     status.status.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())],
              ['Filed on',   new Date(status.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
              status.resolved_at ? ['Resolved on', new Date(status.resolved_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})] : null,
            ].filter(Boolean).map(row => (
              <div key={String(row![0])} className="flex justify-between gap-4">
                <dt className="text-slate-500 shrink-0">{row![0]}</dt>
                <dd className={`font-medium text-right ${row![0]==='Status' && resolved ? 'text-emerald-700' : ''}`}>{row![1]}</dd>
              </div>
            ))}
          </dl>
          {status.resolution_note && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
              <strong>Resolution:</strong> {status.resolution_note}
            </div>
          )}
          <div className="mt-5 pt-5 border-t text-xs text-slate-500 text-center">
            Questions? Email <a href="mailto:grievance@gyansanchaar.com" className="text-brand-600">grievance@gyansanchaar.com</a>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
