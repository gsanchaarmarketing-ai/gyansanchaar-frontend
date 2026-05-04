import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle2, XCircle, Search, Users, Trash2, Eye } from 'lucide-react'
import DeleteStudentButton from '@/components/admin/DeleteStudentButton'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; verified?: string }
}) {
  const sb    = await createServerSupabaseClient()
  const query = searchParams.q?.trim() ?? ''
  const verifiedFilter = searchParams.verified ?? ''

  let dbq = sb
    .from('profiles')
    .select('id,name,phone,phone_verified_at,city,is_minor,role,created_at,dob')
    .eq('role', 'student')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: profiles } = await dbq

  // Pull auth.users for email + verification + last login
  let authMap: Record<string, { email: string; email_confirmed_at: string | null; last_sign_in_at: string | null }> = {}
  try {
    const admin = createAdminSupabaseClient()
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    users?.forEach(u => {
      authMap[u.id] = {
        email: u.email ?? '',
        email_confirmed_at: u.email_confirmed_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }
    })
  } catch { /* SERVICE_ROLE_KEY not set */ }

  // Merge + filter client-side (small dataset)
  let students = (profiles ?? []).map(p => ({
    ...p,
    ...(authMap[p.id] ?? { email: '', email_confirmed_at: null, last_sign_in_at: null }),
  }))

  if (query) {
    const q = query.toLowerCase()
    students = students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    )
  }

  if (verifiedFilter === 'email') students = students.filter(s => !!s.email_confirmed_at)
  if (verifiedFilter === 'unverified') students = students.filter(s => !s.email_confirmed_at)

  const total     = profiles?.length ?? 0
  const emailVerified = Object.values(authMap).filter(a => a.email_confirmed_at).length
  const phoneVerified = (profiles ?? []).filter(p => p.phone_verified_at).length

  function fmt(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-white/30 text-sm mt-0.5">{total} registered</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',           value: total,         color: 'text-white'         },
          { label: 'Email Verified',  value: emailVerified, color: 'text-emerald-400'   },
          { label: 'Phone Verified',  value: phoneVerified, color: 'text-blue-400'      },
          { label: 'Unverified',      value: total - emailVerified, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-white/30 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, email or phone…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
          />
        </div>
        <select
          name="verified"
          defaultValue={verifiedFilter}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-white/25"
        >
          <option value="">All students</option>
          <option value="email">Email verified</option>
          <option value="unverified">Email not verified</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
          Filter
        </button>
        {(query || verifiedFilter) && (
          <Link href="/admin/students" className="text-white/40 hover:text-white text-sm px-3 py-2.5 rounded-xl border border-white/10 text-center transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Verified</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Last Login</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Registered</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-white/3 transition-colors group">
                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white/90">{s.name || '—'}</div>
                    {s.is_minor && <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">Minor</span>}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4">
                    <div className="text-white/50 text-xs">{s.email || '—'}</div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4">
                    <div className="text-white/50 text-xs">{s.phone || '—'}</div>
                  </td>

                  {/* Verified badges */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        {s.email_confirmed_at
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0" />}
                        <span className={`text-[10px] font-medium ${s.email_confirmed_at ? 'text-emerald-400' : 'text-white/30'}`}>
                          {s.email_confirmed_at ? 'Email ✓' : 'Email ✗'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {s.phone_verified_at
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-white/20 shrink-0" />}
                        <span className={`text-[10px] font-medium ${s.phone_verified_at ? 'text-blue-400' : 'text-white/25'}`}>
                          {s.phone_verified_at ? 'Phone ✓' : 'Phone ✗'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Last login */}
                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                    {fmt(s.last_sign_in_at)}
                  </td>

                  {/* Registered */}
                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                    {fmt(s.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      <DeleteStudentButton id={s.id} name={s.name || 'this student'} />
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-white/20 text-sm">
                    {query ? `No students match "${query}"` : 'No students registered yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-white/20 text-xs">Showing {students.length} of {total} students</p>
    </div>
  )
}
