import { createServerSupabaseClient } from '@/lib/supabase'
import { CheckCircle2, XCircle } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AdminStudents({ searchParams }: { searchParams: { q?: string } }) {
  const sb = await createServerSupabaseClient()
  const admin = (await import('@/lib/supabase')).createAdminSupabaseClient()

  let q = sb.from('profiles').select('id,name,phone,phone_verified_at,city,is_minor,role,created_at').eq('role','student').is('deleted_at',null).order('created_at',{ascending:false})
  const { data: students } = await q

  // Get emails from auth.users via admin client
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 500 })
  const emailMap: Record<string,string> = {}
  users?.forEach(u => { emailMap[u.id] = u.email ?? '' })

  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-white">Students</h1><p className="text-white/30 text-sm mt-0.5">{students?.length ?? 0} registered</p></div>
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Name','Email','Phone','City','Minor','Joined'].map(h=><th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {students?.map(s => (
              <tr key={s.id} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-3.5 font-medium text-white/90">{s.name}</td>
                <td className="px-5 py-3.5 text-white/40 text-xs">{emailMap[s.id] ?? '—'}</td>
                <td className="px-5 py-3.5 text-xs">
                  <span className="text-white/50">{s.phone ?? '—'}</span>
                  {s.phone && (s.phone_verified_at
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400 inline ml-1.5" />
                    : <XCircle className="w-3 h-3 text-white/20 inline ml-1.5" />)}
                </td>
                <td className="px-5 py-3.5 text-white/30 text-xs">{s.city ?? '—'}</td>
                <td className="px-5 py-3.5">{s.is_minor ? <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">Minor</span> : <span className="text-white/20 text-xs">—</span>}</td>
                <td className="px-5 py-3.5 text-white/25 text-xs">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {!students?.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No students yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
