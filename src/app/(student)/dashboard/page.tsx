import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import FirstVisitModal from '@/components/dashboard/FirstVisitModal'
import SignOutButton from '@/components/dashboard/SignOutButton'
import Link from 'next/link'
import {
  ArrowRight, FileText, Building2, CheckCircle2,
  AlertCircle, Calendar, Download, Bell, User, Shield, Sparkles,
  Video, Clock, MessageCircle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string,string> = {
  applied:             'bg-blue-100 text-blue-800',
  approved:            'bg-emerald-100 text-emerald-800',
  interview_scheduled: 'bg-violet-100 text-violet-800',
  admitted:            'bg-green-100 text-green-800',
  rejected:            'bg-rose-100 text-rose-800',
  withdrawn:           'bg-slate-100 text-slate-600',
}
const STATUS_LABEL: Record<string,string> = {
  applied:             'Applied',
  approved:            'Approved ✓',
  interview_scheduled: 'Interview Scheduled',
  admitted:            'Admitted 🎉',
  rejected:            'Not Selected',
  withdrawn:           'Withdrawn',
}

export default async function DashboardPage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, appsRes, bookingsRes] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).single(),
    sb.from('applications')
      .select('id, status, branch, interview_at, admission_letter_path, created_at, updated_at, college_id, course_id, colleges(id,name,slug,city), courses(id,name,level)')
      .eq('student_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false }),
    sb.from('bookings')
      .select('id, date, start_time, end_time, status, meeting_link, meeting_platform, student_notes, created_at, colleges(id,name,slug), counsellors(name)')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile  = profileRes.data
  const apps     = appsRes.data ?? []
  const bookings = bookingsRes.data ?? []

  if (!profile) redirect('/login')

  // Profile complete = has father_name + address (phone_verify optional until WhatsApp live)
  const profileComplete = !!(profile.father_name && profile.address)
  const isMinorPending  = profile.is_minor && !profile.parental_consent_verified

  return (
    <>
      <Header />
      <FirstVisitModal profileComplete={profileComplete} />

      <main className="max-w-2xl mx-auto px-4 py-5 pb-28 md:pb-10">

        {/* Greeting */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Hello, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
            <div className="mt-1.5">
              <SignOutButton />
            </div>
          </div>
          <Link href="/dashboard/profile"
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 hover:bg-blue-200 transition-colors">
            {profile.name.charAt(0).toUpperCase()}
          </Link>
        </div>

        {/* ── MINOR ALERT ─────────────────────────────────────────────── */}
        {isMinorPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 text-sm">Parent consent required</div>
                <div className="text-slate-600 text-xs mt-1 mb-3">
                  You're under 18. DPDP Act 2023 §9 requires parent consent before applying.
                </div>
                <Link href="/dashboard/parental-consent"
                  className="inline-flex items-center gap-1.5 bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs">
                  Get parent consent <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE INCOMPLETE BANNER ────────────────────────────────── */}
        {!profileComplete && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 mb-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-0.5">Complete your application profile</div>
                <div className="text-white/70 text-xs leading-relaxed mb-4">
                  Fill it once — apply to any college with one tap. Father's name, address, course, and marksheets.
                </div>
                <Link href="/dashboard/application"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm">
                  Start Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE COMPLETE + NO APPS ──────────────────────────────── */}
        {profileComplete && apps.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 text-sm">Profile ready! Start applying</div>
                <div className="text-slate-500 text-xs mt-0.5">Browse colleges and apply free with one tap.</div>
              </div>
            </div>
            <Link href="/colleges"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors">
              <Building2 className="w-4 h-4" />Browse Colleges & Apply
            </Link>
          </div>
        )}

        {/* ── APPLICATIONS ─────────────────────────────────────────────── */}
        {apps.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">My Applications ({apps.length})</h2>
              <Link href="/dashboard/applications" className="text-blue-600 text-xs font-semibold">View all →</Link>
            </div>
            <div className="space-y-3">
              {apps.map((app: any) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm line-clamp-1">
                        {app.colleges?.name ?? 'College'}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {app.courses?.name ?? 'Course'}
                        {app.branch ? ` · ${app.branch}` : ''}
                        {app.colleges?.city ? ` · ${app.colleges.city}` : ''}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[app.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABEL[app.status] ?? app.status}
                    </span>
                  </div>

                  {/* Action buttons per status */}
                  <div className="flex flex-wrap gap-2">
                    {app.admission_letter_path && (
                      <a href={app.admission_letter_path} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors">
                        <Download className="w-3.5 h-3.5" />Download Admission Letter
                      </a>
                    )}
                    {app.status === 'approved' && !app.interview_at && (
                      <Link href={`/dashboard/applications/${app.id}/interview`}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                        <Calendar className="w-3.5 h-3.5" />Schedule Interview
                      </Link>
                    )}
                    {app.interview_at && (
                      <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Interview: {new Date(app.interview_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {profileComplete && (
              <Link href="/colleges"
                className="flex items-center justify-between mt-3 border border-blue-300 text-blue-600 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
                Apply to more colleges <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </section>
        )}

        {/* ── COUNSELLING SESSIONS ─────────────────────────────────── */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">
              Counselling Sessions {bookings.length > 0 && `(${bookings.length})`}
            </h2>
            <Link href="/dashboard/counselling" className="text-blue-600 text-xs font-semibold">
              {bookings.length > 0 ? 'View all →' : 'Book free →'}
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 text-sm">Talk to a counsellor — free</div>
                <div className="text-slate-500 text-xs mt-0.5 mb-3">
                  Get expert guidance on colleges, courses, and careers. 30-min session, no cost.
                </div>
                <Link href="/dashboard/counselling"
                  className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Book a Session
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b: any) => {
                const BOOKING_COLOR: Record<string, string> = {
                  pending:   'bg-amber-100 text-amber-800',
                  confirmed: 'bg-blue-100 text-blue-800',
                  completed: 'bg-emerald-100 text-emerald-800',
                  cancelled: 'bg-rose-100 text-rose-600',
                }
                const BOOKING_LABEL: Record<string, string> = {
                  pending:   'Pending',
                  confirmed: 'Confirmed ✓',
                  completed: 'Completed',
                  cancelled: 'Cancelled',
                }
                const dateStr = b.date
                  ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null
                const timeStr = b.start_time ? b.start_time.slice(0, 5) : null

                return (
                  <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm">
                          {b.colleges?.name ?? 'General Counselling'}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          {b.counsellors?.name ? `with ${b.counsellors.name}` : 'Counsellor TBD'}
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${BOOKING_COLOR[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {BOOKING_LABEL[b.status] ?? b.status}
                      </span>
                    </div>

                    {/* Date / time / platform */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      {dateStr && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />{dateStr}
                        </span>
                      )}
                      {timeStr && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />{timeStr}
                        </span>
                      )}
                      {b.meeting_platform && (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3 text-slate-400" />{b.meeting_platform}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {b.status === 'confirmed' && b.meeting_link && (
                        <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                          <Video className="w-3.5 h-3.5" /> Join Session
                        </a>
                      )}
                      {b.status === 'pending' && (
                        <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" /> Awaiting confirmation
                        </span>
                      )}
                      {b.status === 'completed' && (
                        <Link href="/dashboard/counselling"
                          className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
                          Book another session
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}

              <Link href="/dashboard/counselling"
                className="flex items-center justify-between border border-purple-200 text-purple-600 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-purple-50 transition-colors">
                Book another session <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ── QUICK LINKS ──────────────────────────────────────────────── */}
        <section>
          <h2 className="font-bold text-slate-800 mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard/notifications', icon: Bell,          label: 'Notifications',       sub: 'Application updates'    },
              { href: '/dashboard/application',   icon: User,          label: 'My Profile',          sub: 'Edit details & docs'    },
              { href: '/dashboard/documents',     icon: FileText,      label: 'Documents',           sub: 'Marksheets uploaded'    },
              { href: '/dashboard/privacy',       icon: Shield,        label: 'Privacy & Consent',   sub: 'DPDP Act 2023'          },
            ].map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                <Icon className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-semibold text-slate-800 text-sm">{label}</div>
                <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <MobileNav />
    </>
  )
}
