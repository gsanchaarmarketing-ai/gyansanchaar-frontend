import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Pencil, Eye, BadgeCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminColleges({ searchParams }: { searchParams: { q?: string } }) {
  const sb = await createServerSupabaseClient()
  const q  = searchParams.q ?? ''

  let query = sb.from('colleges')
    .select('id,name,slug,type,city,states(name),is_active,is_featured,ugc_verified,nirf_rank,naac_grade,created_at')
    .order('is_featured', { ascending: false })
    .order('name')
    .is('deleted_at', null)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: colleges } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Colleges</h1>
          <p className="text-white/30 text-sm mt-0.5">{colleges?.length ?? 0} total</p>
        </div>
        <Link href="/admin/colleges/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add College
        </Link>
      </div>

      {/* Search */}
      <form className="mb-5">
        <input name="q" defaultValue={q} placeholder="Search colleges…"
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 w-72 transition-colors" />
      </form>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['College','Location','Type','NAAC','Status','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {colleges?.map(c => (
              <tr key={c.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white/90">{c.name}</span>
                    {c.is_featured && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">★ Featured</span>}
                    {c.ugc_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  {c.nirf_rank && <div className="text-[10px] text-white/30 mt-0.5">NIRF #{c.nirf_rank}</div>}
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{c.city}{(c.states as any)?.name ? `, ${(c.states as any).name}` : ''}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] capitalize bg-white/5 text-white/40 px-2 py-0.5 rounded-full">{c.type}</span>
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{c.naac_grade ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/25'}`}>
                    {c.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/colleges/${c.id}`}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <Link href={`/colleges/${c.slug}`} target="_blank"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!colleges?.length && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No colleges found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
