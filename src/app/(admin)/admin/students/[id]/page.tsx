import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, GraduationCap, User } from 'lucide-react'
import DeleteStudentButton from '@/components/admin/DeleteStudentButton'

export const dynamic = 'force-dynamic'

function fmt(d: string | null | undefined, includeTime = false) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const sb = await createServerSupabaseClient()

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'student')
    .is('deleted_at', null)
    .single()

  if (!profile) notFound()

  // Auth user
  let authUser: any = null
  let loginSessions: any[] = []
  try {
    const admin = createAdminSupabaseClient()
    const { data: { user } } = await admin.auth.admin.getUserById(params.id)
    authUser = user
  } catch { }

  // Applications
  const { data: applications } = await sb
    .from('applications')
    .select('id,status,created_at,colleges(name),courses(name)')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  // Consent records
  const { data: consents } = await sb
    .from('consent_records')
    .select('purpose,action,policy_version,created_at')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })

  const emailVerified = !!authUser?.email_confirmed_at
  const phoneVerified = !!profile.phone_verified_at

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/students" className="text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.name || 'Unnamed Student'}</h1>
            <p className="text-white/30 text-xs mt-0.5">ID: {params.id}</p>
          </div>
        </div>
        <DeleteStudentButton id={params.id} name={profile.name || 'this student'} redirect="/admin/students" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Left — Profile card */}
        <div className="md:col-span-2 space-y-4">

          {/* Basic info */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider">Profile Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User,     label: 'Full Name',    value: profile.name },
                { icon: Mail,     label: 'Email',        value: authUser?.email },
                { icon: Phone,    label: 'Phone',        value: profile.phone },
                { icon: MapPin,   label: 'City',         value: profile.city },
                { icon: Calendar, label: 'Date of Birth',value: fmt(profile.dob) },
                { icon: User,     label: "Father's Name", value: profile.father_name },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/25 font-medium uppercase tracking-wider">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                  <div className="text-sm text-white/70">{value || '—'}</div>
                </div>
              ))}
            </div>
            {profile.address && (
              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Address</div>
                <div className="text-sm text-white/60">{profile.address}</div>
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">Applications ({applications?.length ?? 0})</h2>
            {applications?.length ? (
              <div className="space-y-2">
                {applications.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white/80">{a.colleges?.name ?? '—'}</div>
                      <div className="text-xs text-white/30 mt-0.5">{a.courses?.name ?? '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                        a.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>{a.status}</span>
                      <span className="text-xs text-white/20">{fmt(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-sm">No applications yet</p>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Verification status */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider">Verification</h2>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-xl ${emailVerified ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/15'}`}>
                <div className="flex items-center gap-2">
                  <Mail className={`w-3.5 h-3.5 ${emailVerified ? 'text-emerald-400' : 'text-red-400/60'}`} />
                  <span className="text-xs font-semibold text-white/60">Email</span>
                </div>
                {emailVerified
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <XCircle className="w-4 h-4 text-red-400/60" />}
              </div>
              {emailVerified && (
                <div className="text-[10px] text-white/25 px-1">
                  Verified {fmt(authUser?.email_confirmed_at, true)}
                </div>
              )}

              <div className={`flex items-center justify-between p-3 rounded-xl ${phoneVerified ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5 border border-white/8'}`}>
                <div className="flex items-center gap-2">
                  <Phone className={`w-3.5 h-3.5 ${phoneVerified ? 'text-blue-400' : 'text-white/20'}`} />
                  <span className="text-xs font-semibold text-white/60">Phone</span>
                </div>
                {phoneVerified
                  ? <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  : <XCircle className="w-4 h-4 text-white/20" />}
              </div>
              {phoneVerified && (
                <div className="text-[10px] text-white/25 px-1">
                  Verified {fmt(profile.phone_verified_at, true)}
                </div>
              )}
            </div>

            {profile.is_minor && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="text-xs font-bold text-amber-400">⚠️ Minor</div>
                <div className="text-[10px] text-white/30 mt-0.5">Parental consent required</div>
              </div>
            )}
          </div>

          {/* Login record */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider">Login Record</h2>
            <div className="space-y-2.5">
              {[
                { icon: Clock,    label: 'Registered',    value: fmt(profile.created_at, true) },
                { icon: Clock,    label: 'Last Login',    value: fmt(authUser?.last_sign_in_at, true) },
                { icon: Calendar, label: 'Email Verified', value: fmt(authUser?.email_confirmed_at, true) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="text-[10px] text-white/25 uppercase tracking-wider flex items-center gap-1">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent */}
          {consents && consents.length > 0 && (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Consent Records</h2>
              <div className="space-y-2">
                {consents.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/40 capitalize">{c.purpose}</span>
                    <span className={`font-semibold ${c.action === 'granted' ? 'text-emerald-400' : 'text-white/25'}`}>
                      {c.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
