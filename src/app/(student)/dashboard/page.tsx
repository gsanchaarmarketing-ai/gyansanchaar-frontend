import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { ArrowRight, FileText, Building2, Lock } from 'lucide-react'
import { statusColor, statusLabel } from '@/lib/utils'

export default async function DashboardPage() {
  const token = await getToken()
  if (!token) redirect('/login')

  let me, apps
  try {
    [me, apps] = await Promise.all([
      studentApi.me(token),
      studentApi.applications(token),
    ])
  } catch { redirect('/login') }

  const { user, can_submit_application } = me
  const applicationList = apps.data

  return (
    <>
      <Header isLoggedIn />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{user.email}</p>

        {/* Minor parental consent banner — smooth, non-blocking */}
        {user.is_minor && !user.parental_consent_verified && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-amber-800 text-sm">One quick step</div>
              <div className="text-amber-700 text-xs mt-0.5">
                Indian law (DPDP §9) requires your parent's consent before you submit college applications. Takes 2 min.
              </div>
            </div>
            <Link href="/dashboard/parental-consent"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0">
              Verify now
            </Link>
          </div>
        )}

        {/* Application form prompt — first time */}
        {!can_submit_application && !user.is_minor && (
          <div className="mt-4 bg-brand-50 border border-brand-200 rounded-xl p-4">
            <div className="font-semibold text-brand-800 text-sm">Complete your application form</div>
            <div className="text-brand-700 text-xs mt-0.5 mb-3">Fill it once, apply to any college with one click.</div>
            <Link href="/dashboard/application"
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Start application <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Applications', value: applicationList.length, href: '/dashboard/applications', icon: Building2 },
            { label: 'Documents', value: '—', href: '/dashboard/documents', icon: FileText },
            { label: 'Privacy', value: '—', href: '/dashboard/privacy', icon: Lock },
          ].map(({ label, value, href, icon: Icon }) => (
            <Link key={href} href={href}
              className="bg-white border rounded-xl p-3 text-center hover:border-brand-400 transition-colors">
              <Icon className="w-5 h-5 mx-auto text-brand-600 mb-1" />
              <div className="text-base font-bold">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </Link>
          ))}
        </div>

        {/* Recent applications */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">My Applications</h2>
            <Link href="/dashboard/applications" className="text-brand-600 text-xs">View all</Link>
          </div>

          {applicationList.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-slate-500">
              <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-medium text-sm">No applications yet</div>
              <Link href="/colleges" className="text-brand-600 text-sm mt-1 block">Browse colleges →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applicationList.slice(0, 5).map(app => (
                <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                  className="flex items-center justify-between bg-white border rounded-xl p-3 hover:border-brand-400 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{app.college.name}</div>
                    <div className="text-xs text-slate-500">{app.course.name} · {app.branch ?? app.course.level?.toUpperCase()}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                    {statusLabel(app.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Browse CTA */}
        {can_submit_application && (
          <div className="mt-6">
            <Link href="/colleges"
              className="flex items-center justify-between bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors">
              Browse Colleges & Apply
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
