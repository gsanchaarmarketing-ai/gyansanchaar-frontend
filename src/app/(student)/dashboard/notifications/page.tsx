import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { studentApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Bell, Building2, FileText, CheckCircle2, Clock, AlertCircle, Calendar, Download, ArrowRight } from 'lucide-react'
import { statusColor, statusLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function notifIcon(status: string) {
  const map: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    admitted:             { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    approved:             { icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
    interview_scheduled:  { icon: Calendar,     color: 'text-purple-600 bg-purple-50' },
    rejected:             { icon: AlertCircle,  color: 'text-rose-600 bg-rose-50' },
    withdrawn:            { icon: AlertCircle,  color: 'text-slate-500 bg-slate-100' },
    applied:              { icon: Clock,        color: 'text-amber-600 bg-amber-50' },
  }
  return map[status] ?? { icon: Bell, color: 'text-slate-500 bg-slate-100' }
}

function notifTitle(app: any): string {
  const college = app.college?.name ?? 'College'
  const course  = app.course?.name  ?? 'Course'
  switch (app.status) {
    case 'admitted':            return `🎉 Offer received from ${college}`
    case 'approved':            return `✅ Application approved — ${college}`
    case 'interview_scheduled': return `📅 Interview scheduled — ${college}`
    case 'rejected':            return `Application not shortlisted — ${college}`
    case 'applied':             return `Application submitted to ${college}`
    case 'withdrawn':           return `Application withdrawn — ${college}`
    default:                    return `Update from ${college}`
  }
}

function notifBody(app: any): string {
  const course = app.course?.name ?? ''
  switch (app.status) {
    case 'admitted':
      return `Congratulations! You have been offered admission for ${course}. Download your admission letter from the application page.`
    case 'approved':
      return `Your application for ${course} has been reviewed and approved. The college may reach out shortly.`
    case 'interview_scheduled':
      return app.interview_at
        ? `Your interview is scheduled for ${new Date(app.interview_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
        : `An interview has been scheduled for your ${course} application.`
    case 'rejected':
      return `Unfortunately, your application for ${course} was not shortlisted this time. You can continue applying to other colleges.`
    case 'applied':
      return `Your application for ${course} has been submitted successfully. We will notify you of any updates.`
    case 'withdrawn':
      return `You have withdrawn your application for ${course}.`
    default:
      return `Your application status has been updated.`
  }
}

export default async function NotificationsPage() {
  const token = await getToken()
  if (!token) redirect('/login')

  let apps: any[] = []
  try {
    const res = await studentApi.applications(token)
    apps = res.data ?? []
  } catch { redirect('/login') }

  // Sort by most recently updated (use updated_at if available, else created_at)
  const sorted = [...apps].sort((a, b) =>
    new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()
  )

  const hasLetter = sorted.some(a => a.status === 'admitted' && a.admission_letter_path)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-10">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-heading">Notifications</h1>
            <p className="text-xs text-muted">Application updates and alerts</p>
          </div>
        </div>

        {/* Admission letter banner */}
        {hasLetter && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 mb-5 text-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">Admission letter ready</div>
              <div className="text-white/80 text-xs">Download your offer letter from the application page</div>
            </div>
            <Link href="/dashboard/applications"
              className="bg-white text-emerald-700 font-semibold text-xs px-3 py-1.5 rounded-lg flex-shrink-0">
              View
            </Link>
          </div>
        )}

        {/* DPDP notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700 flex items-start gap-2">
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Notifications are sent only via WhatsApp and email. Under the{' '}
            <strong>DPDP Act 2023</strong>, you can manage your communication preferences in{' '}
            <Link href="/dashboard/privacy" className="underline">Privacy Settings</Link>.
          </span>
        </div>

        {/* Notification list */}
        {sorted.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="font-bold text-heading mb-1">No notifications yet</h2>
            <p className="text-sm text-muted mb-5">Apply to colleges to start receiving updates here.</p>
            <Link href="/colleges"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-colors">
              Browse Colleges <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(app => {
              const { icon: Icon, color } = notifIcon(app.status)
              const isNew = app.status !== 'withdrawn'
              return (
                <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                  className={`block bg-white border rounded-2xl p-4 hover:border-primary transition-all group ${
                    isNew && app.status === 'admitted' ? 'border-emerald-200 shadow-sm' : 'border-border'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-heading leading-snug">
                          {notifTitle(app)}
                        </p>
                        <span className="text-[11px] text-muted flex-shrink-0">
                          {timeAgo(app.updated_at ?? app.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-body mt-1 leading-relaxed line-clamp-2">
                        {notifBody(app)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(app.status)}`}>
                          {statusLabel(app.status)}
                        </span>
                        {app.status === 'interview_scheduled' && app.interview_at && (
                          <span className="flex items-center gap-1 text-[11px] text-purple-700 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.interview_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {app.status === 'admitted' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <Download className="w-3 h-3" /> Download letter →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* View all applications link */}
        {sorted.length > 0 && (
          <Link href="/dashboard/applications"
            className="mt-5 flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2">
            View all applications <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </main>
      <MobileNav />
    </>
  )
}
