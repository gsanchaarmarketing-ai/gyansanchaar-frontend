import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi, ApiError } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import FirstVisitModal from '@/components/dashboard/FirstVisitModal'
import DashboardLoadError from '@/components/dashboard/DashboardLoadError'
import Link from 'next/link'
import {
  ArrowRight, FileText, Building2, CheckCircle2,
  Clock, AlertCircle, Calendar, Download, MessageCircle,
  ChevronRight, User, Shield, BookOpen, Sparkles, Bell
} from 'lucide-react'
import { statusColor, statusLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const token = await getToken()
  if (!token) redirect('/login')

  let me: any, apps: any
  try {
    ;[me, apps] = await Promise.all([
      studentApi.me(token),
      studentApi.applications(token),
    ])
  } catch (err: any) {
    // Only force logout on 401 (token actually invalid).
    // Other errors (timeout, 500, network blip) → show retry UI instead of
    // silently logging the user out. Free-tier cold starts must not = logout.
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login')
    }
    return <DashboardLoadError />
  }

  const { user, can_submit_application } = me
  const applicationList: any[] = apps?.data ?? []
  const profileComplete = can_submit_application

  return (
    <>
      <Header />
      <FirstVisitModal profileComplete={profileComplete} />
      <main className="max-w-3xl mx-auto px-4 py-5 pb-28 md:pb-10">

        {/* Greeting */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-heading">
              Hello, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-muted text-xs mt-0.5">{user.phone ? `+91 ${user.phone}` : user.email}</p>
          </div>
          <Link href="/dashboard/profile"
            className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm border border-border">
            {user.name.charAt(0).toUpperCase()}
          </Link>
        </div>

        {/* ── STEP 1: Profile not complete ─────────────────────── */}
        {!profileComplete && !user.is_minor && (
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-5 mb-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="flex items-start gap-3 relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-0.5">Complete your application profile</div>
                <div className="text-white/70 text-xs leading-relaxed mb-4">
                  Fill it once — use it to apply to any college with a single tap.
                  Takes less than 5 minutes.
                </div>
                <div className="space-y-1.5 mb-4">
                  {[
                    "Father's name & contact details",
                    'Academic documents (10th, 12th marksheets)',
                    'Course preference',
                  ].map(s => (
                    <div key={s} className="flex items-center gap-2 text-white/80 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/application"
                  className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-xl text-sm">
                  Start Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1b: Parental consent (minors) ─────────────── */}
        {user.is_minor && !user.parental_consent_verified && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-heading text-sm mb-0.5">Parent consent required</div>
                <div className="text-body text-xs mb-3">
                  You're under 18. DPDP Act 2023 §9 requires your parent to consent before you apply.
                </div>
                <Link href="/dashboard/parental-consent"
                  className="inline-flex items-center gap-2 bg-warning text-white font-semibold px-4 py-2 rounded-xl text-xs">
                  Verify parent consent <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Profile complete: Browse CTA ─────────────────────── */}
        {profileComplete && applicationList.length === 0 && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-heading text-sm">Profile complete! Start applying</div>
                <div className="text-body text-xs mt-0.5">Browse colleges and apply with one tap.</div>
              </div>
            </div>
            <Link href="/colleges" className="flex items-center justify-between mt-4 bg-primary text-white px-4 py-3 rounded-xl font-semibold text-sm">
              Browse Colleges & Apply <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Applications ─────────────────────────────────────── */}
        {applicationList.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-heading">My Applications</h2>
              <Link href="/dashboard/applications" className="text-primary text-xs font-semibold">View all →</Link>
            </div>
            <div className="space-y-3">
              {applicationList.map((app: any) => (
                <div key={app.id} className="bg-white border border-border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-heading text-sm line-clamp-1">{app.college?.name}</div>
                      <div className="text-muted text-xs mt-0.5">{app.course?.name} · {app.branch ?? app.course?.level?.toUpperCase()}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${statusColor(app.status)}`}>
                      {statusLabel(app.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Admission letter */}
                    {(app as any).admission_letter_url && (
                      <a href={(app as any).admission_letter_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Download className="w-3.5 h-3.5" /> Download Admission Letter
                      </a>
                    )}

                    {/* Schedule interview when approved */}
                    {app.status === 'approved' && !app.interview_at && (
                      <Link href={`/dashboard/applications/${app.id}/interview`}
                        className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                      </Link>
                    )}

                    {/* Interview scheduled */}
                    {app.interview_at && (
                      <div className="flex items-center gap-1.5 bg-primary-light text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Interview: {new Date(app.interview_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    )}

                    <Link href={`/dashboard/counselling?application_id=${app.id}`}
                      className="flex items-center gap-1.5 bg-primary-light text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> Book Counselling
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {profileComplete && (
              <Link href="/colleges" className="flex items-center justify-between mt-4 border border-primary text-primary px-4 py-3 rounded-xl font-semibold text-sm">
                Apply to more colleges <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </section>
        )}

        {/* ── Quick links ───────────────────────────────────────── */}
        <section>
          <h2 className="font-bold text-heading mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard/notifications', icon: Bell,          label: 'Notifications',  sub: 'Application updates' },
              { href: '/dashboard/counselling',   icon: MessageCircle, label: 'Counselling',    sub: 'Book college sessions' },
              { href: '/dashboard/application',   icon: User,          label: 'My Profile',     sub: 'Edit details & documents' },
              { href: '/dashboard/documents',     icon: FileText,      label: 'Documents',      sub: 'Marksheets & certificates' },
              { href: '/dashboard/privacy',       icon: Shield,        label: 'Privacy',        sub: 'Data & consent settings' },
            ].map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href}
                className="bg-white border border-border rounded-2xl p-4 hover:border-primary transition-colors">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-heading text-sm">{label}</div>
                <div className="text-muted text-xs mt-0.5">{sub}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </>
  )
}
