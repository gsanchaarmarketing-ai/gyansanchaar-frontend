import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AlertCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  open:         'bg-rose-500/15 text-rose-400',
  acknowledged: 'bg-amber-500/15 text-amber-400',
  in_progress:  'bg-blue-500/15 text-blue-400',
  resolved:     'bg-emerald-500/15 text-emerald-400',
  rejected:     'bg-white/5 text-white/30',
  escalated:    'bg-violet-500/15 text-violet-400',
}

export default async function AdminGrievances({ searchParams }: { searchParams: { status?: string } }) {
  const sb = await createServerSupabaseClient()

  let q = sb.from('grievances')
    .select('id,ticket_id,complainant_name,complainant_email,category,subject,status,created_at,resolved_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (searchParams.status) q = q.eq('status', searchParams.status)
  const { data: grievances } = await q
  const { data: counts } = await sb.from('grievances').select('status').is('deleted_at', null)
  const countMap: Record<string, number> = {}
  for (const r of counts ?? []) countMap[r.status] = (countMap[r.status] ?? 0) + 1

  const STATUSES = ['open','acknowledged','in_progress','resolved','rejected','escalated']

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Grievances</h1>
        <p className="text-white/30 text-sm mt-0.5">IT Rules 2021 · DPDP Act 2023 — acknowledge within 48h, resolve within 30 days</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/admin/grievances" className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!searchParams.status ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
          All ({counts?.length ?? 0})
        </Link>
        {STATUSES.map(s => (
          <Link key={s} href={`/admin/grievances?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${searchParams.status === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
            {s.replace(/_/g,' ')} ({countMap[s] ?? 0})
          </Link>
        ))}
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Ticket','Complainant','Category','Subject','Status','Filed','Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {grievances?.map(g => {
              const daysSince = Math.floor((Date.now() - new Date(g.created_at).getTime()) / 86400000)
              const urgent = g.status === 'open' && daysSince >= 1
              return (
                <tr key={g.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-400">{g.ticket_id}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-white/80 text-xs font-medium">{g.complainant_name}</div>
                    <div className="text-white/30 text-[10px] truncate max-w-[140px]">{g.complainant_email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full capitalize">
                      {g.category.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/70 text-xs max-w-[200px] truncate">{g.subject}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ${STATUS_COLOR[g.status]}`}>
                      {g.status.replace(/_/g,' ')}
                    </span>
                    {urgent && (
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-rose-400">
                        <AlertCircle className="w-2.5 h-2.5" />{daysSince}d old — acknowledge now
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-white/30 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(g.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/grievances/${g.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                      Respond →
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!grievances?.length && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-white/20 text-sm">No grievances found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
