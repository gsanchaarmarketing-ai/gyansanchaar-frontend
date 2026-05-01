import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Pencil, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminExams() {
  const sb = await createServerSupabaseClient()
  const { data: exams } = await sb.from('exams')
    .select('id,name,short_name,slug,level,conducting_body,exam_date,registration_end,is_active')
    .order('exam_date', { ascending: true, nullsFirst: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entrance Exams</h1>
          <p className="text-white/30 text-sm mt-0.5">{exams?.length ?? 0} total</p>
        </div>
        <Link href="/admin/exams/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add Exam
        </Link>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Exam','Conducting Body','Level','Exam Date','Reg. Closes','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {exams?.map(e => (
              <tr key={e.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-white/90">{e.short_name ?? e.name}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{e.name !== e.short_name ? e.name : ''}</div>
                </td>
                <td className="px-5 py-3.5 text-white/40 text-xs">{e.conducting_body ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] uppercase bg-white/5 text-white/40 px-2 py-0.5 rounded-full">{e.level}</span>
                </td>
                <td className="px-5 py-3.5 text-white/50 text-xs">
                  {e.exam_date ? (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(e.exam_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3.5 text-white/30 text-xs">
                  {e.registration_end ? new Date(e.registration_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="px-5 py-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/exams/${e.id}`}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white inline-flex transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {!exams?.length && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No exams found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
