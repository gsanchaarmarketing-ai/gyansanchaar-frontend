import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'

const LEVEL_COLOR: Record<string, string> = {
  ug:          'bg-emerald-500/15 text-emerald-400',
  pg:          'bg-blue-500/15 text-blue-400',
  phd:         'bg-violet-500/15 text-violet-400',
  diploma:     'bg-amber-500/15 text-amber-400',
  certificate: 'bg-rose-500/15 text-rose-400',
}

export default async function AdminCourses({ searchParams }: { searchParams: { q?: string } }) {
  const sb = await createServerSupabaseClient()
  let q = sb.from('courses')
    .select('id,name,slug,level,duration_months,default_fee,fee_min,fee_max,is_active,streams(name)')
    .order('level').order('name')
  if (searchParams.q) q = q.ilike('name', `%${searchParams.q}%`)
  const { data: courses } = await q

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-white/30 text-sm mt-0.5">{courses?.length ?? 0} total</p>
        </div>
        <Link href="/admin/courses/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add Course
        </Link>
      </div>

      <form className="mb-5">
        <input name="q" defaultValue={searchParams.q} placeholder="Search courses…"
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 w-72 transition-colors" />
      </form>

      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Course','Stream','Level','Duration','Fee Range','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {courses?.map(c => (
              <tr key={c.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-5 py-3.5 font-medium text-white/90">{c.name}</td>
                <td className="px-5 py-3.5 text-white/40 text-xs">{(c.streams as any)?.name ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${LEVEL_COLOR[c.level] ?? 'bg-white/5 text-white/40'}`}>
                    {c.level}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">{c.duration_months}mo</td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {c.fee_min && c.fee_max
                    ? `₹${(c.fee_min/100000).toFixed(1)}L – ₹${(c.fee_max/100000).toFixed(1)}L`
                    : c.default_fee
                      ? `₹${(c.default_fee/100000).toFixed(1)}L avg`
                      : '—'}
                </td>
                <td className="px-5 py-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/courses/${c.id}`}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white inline-flex transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {!courses?.length && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No courses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
