import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  applied:             'bg-blue-500/15 text-blue-400',
  approved:            'bg-emerald-500/15 text-emerald-400',
  interview_scheduled: 'bg-violet-500/15 text-violet-400',
  admitted:            'bg-amber-500/15 text-amber-400',
  rejected:            'bg-rose-500/15 text-rose-400',
  withdrawn:           'bg-white/5 text-white/30',
}

export default async function AdminApplications({ searchParams }: { searchParams: { status?: string } }) {
  const sb = await createServerSupabaseClient()

  let q = sb.from('applications')
    .select(`
      id, status, branch, interview_at, admission_letter_path, created_at, updated_at,
      profiles!applications_student_id_fkey(name, phone),
      colleges(id, name, slug, city),
      courses(id, name, level)
    `)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (searchParams.status) q = q.eq('status', searchParams.status)
  const { data: apps } = await q

  // Counts per status
  const { data: counts } = await sb.from('applications')
    .select('status')
    .is('deleted_at', null)

  const countMap: Record<string, number> = {}
  for (const r of counts ?? []) countMap[r.status] = (countMap[r.status] ?? 0) + 1

  const STATUSES = ['applied', 'approved', 'interview_scheduled', 'admitted', 'rejected', 'withdrawn']

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-white/30 text-sm mt-0.5">{apps?.length ?? 0} {searchParams.status ? `with status ${searchParams.status.replace(/_/g,' ')}` : 'total'}</p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/admin/applications"
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!searchParams.status ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
          All ({counts?.length ?? 0})
        </Link>
        {STATUSES.map(s => (
          <Link key={s} href={`/admin/applications?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${searchParams.status === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
            {s.replace(/_/g, ' ')} ({countMap[s] ?? 0})
          </Link>
        ))}
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Student','College','Course','Status','Applied','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {apps?.map((app: any) => (
              <tr key={app.id} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-white/90">{app.profiles?.name ?? 'Unknown'}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">+91 {app.profiles?.phone ?? '—'}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-white/70 text-xs">{app.colleges?.name}</div>
                  <div className="text-[10px] text-white/30">{app.colleges?.city}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-white/70 text-xs">{app.courses?.name}</div>
                  {app.branch && <div className="text-[10px] text-white/30">{app.branch}</div>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status]}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {app.admission_letter_path && <div className="text-[9px] text-emerald-400 mt-1">📄 Letter uploaded</div>}
                </td>
                <td className="px-5 py-3.5 text-white/30 text-xs">
                  {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/applications/${app.id}`}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {!apps?.length && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No applications found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
