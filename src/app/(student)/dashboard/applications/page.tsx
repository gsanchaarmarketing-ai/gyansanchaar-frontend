import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { statusColor, statusLabel } from '@/lib/utils'
import { Building2, Calendar } from 'lucide-react'

export default async function ApplicationsPage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: apps } = await sb.from('applications').select(`
    id, status, branch, interview_at, created_at,
    colleges(id,name,slug,city,states(name)),
    courses(id,name,level)
  `).eq('student_id', user.id).is('deleted_at', null).order('created_at', { ascending: false })

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">My Applications</h1>
          <Link href="/colleges" className="text-brand-600 text-sm">+ Apply to college</Link>
        </div>
        {(apps ?? []).length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <div className="font-medium">No applications yet</div>
            <Link href="/colleges" className="text-brand-600 text-sm mt-2 block">Browse colleges →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(apps ?? []).map(app => (
              <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                className="block bg-white border rounded-xl p-4 hover:border-brand-400 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{(app.colleges as any)?.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{(app.courses as any)?.name} · {app.branch ?? (app.courses as any)?.level?.toUpperCase()}</div>
                    {app.interview_at && (
                      <div className="flex items-center gap-1 text-xs text-purple-700 mt-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        Interview: {new Date(app.interview_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusColor(app.status)}`}>
                    {statusLabel(app.status)}
                  </span>
                </div>
                {app.status === 'admitted' && (
                  <div className="mt-2 text-xs text-emerald-700 font-medium">
                    🎉 Congratulations! View or download your admission letter →
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
