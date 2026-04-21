import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Grievance Status | GyanSanchaar' }

export default async function GrievanceStatusPage({ params }: { params: { ticket: string } }) {
  let status
  try { status = await publicApi.grievanceStatus(params.ticket) }
  catch { return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Ticket Not Found</h1>
        <p className="text-slate-500 text-sm">The ticket <strong>{params.ticket}</strong> was not found. Double-check the ID from your acknowledgement email.</p>
      </main>
      <MobileNav />
    </>
  )}

  const resolved = ['resolved','rejected'].includes(status.status)
  const overdue  = status.is_overdue

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-center mb-5">
            {resolved
              ? <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              : overdue
              ? <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
              : <Clock className="w-12 h-12 text-brand-500 mx-auto" />}
          </div>
          <h1 className="text-xl font-bold text-center mb-4">Grievance Status</h1>
          <dl className="space-y-3 text-sm">
            {[
              ['Ticket ID', status.ticket_id],
              ['Status', status.status.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())],
              ['Filed on', new Date(status.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
              ['SLA Due', new Date(status.sla_due_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
            ].map(([k,v]) => (
              <div key={String(k)} className="flex justify-between">
                <dt className="text-slate-500">{k}</dt>
                <dd className={`font-medium ${k==='Status' && resolved ? 'text-emerald-700' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
          {overdue && !resolved && (
            <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
              This grievance has exceeded the 15-day resolution SLA (IT Rules 2021). You may escalate to the Grievance Appellate Committee or file a complaint with the Data Protection Board of India.
            </div>
          )}
          <div className="mt-5 pt-5 border-t text-xs text-slate-500 text-center">
            Questions? Email <a href="mailto:grievance@gyansanchaar.cloud" className="text-brand-600">grievance@gyansanchaar.cloud</a>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
