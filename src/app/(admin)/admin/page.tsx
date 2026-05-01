import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Building2, BookOpen, Users, FileText, ClipboardList, TrendingUp, AlertCircle, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const sb = await createServerSupabaseClient()

  const [
    { count: colleges },
    { count: courses },
    { count: articles },
    { count: students },
    { count: applications },
    { count: exams },
    { count: openGrievances },
    { count: pendingApps },
  ] = await Promise.all([
    sb.from('colleges').select('*', { count:'exact', head:true }).eq('is_active', true),
    sb.from('courses').select('*', { count:'exact', head:true }),
    sb.from('articles').select('*', { count:'exact', head:true }),
    sb.from('profiles').select('*', { count:'exact', head:true }).eq('role', 'student'),
    sb.from('applications').select('*', { count:'exact', head:true }),
    sb.from('exams').select('*', { count:'exact', head:true }),
    sb.from('grievances').select('*', { count:'exact', head:true }).in('status', ['open','acknowledged']),
    sb.from('applications').select('*', { count:'exact', head:true }).eq('status', 'applied'),
  ])

  const stats = [
    { label: 'Colleges',          value: colleges      ?? 0, icon: Building2,    href: '/admin/colleges',     color: 'blue'    },
    { label: 'Courses',           value: courses       ?? 0, icon: BookOpen,     href: '/admin/courses',      color: 'violet'  },
    { label: 'Students',          value: students      ?? 0, icon: Users,        href: '/admin/students',     color: 'emerald' },
    { label: 'Applications',      value: applications  ?? 0, icon: TrendingUp,   href: '/admin/applications', color: 'amber'   },
    { label: 'Pending Review',    value: pendingApps   ?? 0, icon: CalendarCheck,href: '/admin/applications?status=applied', color: 'orange' },
    { label: 'Articles',          value: articles      ?? 0, icon: FileText,     href: '/admin/articles',     color: 'rose'    },
    { label: 'Exams',             value: exams         ?? 0, icon: ClipboardList,href: '/admin/exams',        color: 'cyan'    },
    { label: 'Open Grievances',   value: openGrievances?? 0, icon: AlertCircle,  href: '/admin/grievances?status=open', color: openGrievances ? 'red' : 'slate' },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rose:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    slate:  'bg-white/5 text-white/40 border-white/10',
  }

  // Recent applications needing action
  const { data: recentApps } = await sb.from('applications')
    .select('id,status,created_at,profiles!applications_student_id_fkey(name),colleges(name,city)')
    .in('status', ['applied','approved'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">GyanSanchaar admin overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className={`border rounded-xl p-4 hover:border-white/20 transition-all group ${colorMap[color]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
                <div className="text-xs mt-1 opacity-70">{label}</div>
              </div>
              <Icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Applications needing action */}
      {recentApps && recentApps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Needs Action</h2>
            <Link href="/admin/applications" className="text-blue-400 text-xs hover:text-blue-300">View all →</Link>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            {recentApps.map((app: any) => (
              <Link key={app.id} href={`/admin/applications/${app.id}`}
                className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                <div>
                  <div className="text-sm text-white/90 font-medium">{app.profiles?.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">{app.colleges?.name}, {app.colleges?.city}</div>
                </div>
                <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ${
                  app.status === 'applied' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {app.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/admin/applications',   label: 'Review Applications' },
            { href: '/admin/colleges/new',   label: '+ Add College'       },
            { href: '/admin/courses/new',    label: '+ Add Course'        },
            { href: '/admin/articles/new',   label: '+ New Article'       },
            { href: '/admin/exams/new',      label: '+ Add Exam'          },
            { href: '/admin/grievances',     label: 'Check Grievances'    },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-all">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
