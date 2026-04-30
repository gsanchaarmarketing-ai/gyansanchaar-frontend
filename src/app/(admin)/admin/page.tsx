import { createServerSupabaseClient } from '@/lib/supabase'
import { Building2, BookOpen, Users, FileText, ClipboardList, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const sb = await createServerSupabaseClient()

  const [
    { count: colleges },
    { count: courses },
    { count: articles },
    { count: students },
    { count: applications },
    { count: exams },
  ] = await Promise.all([
    sb.from('colleges').select('*', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('courses').select('*', { count: 'exact', head: true }),
    sb.from('articles').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    sb.from('applications').select('*', { count: 'exact', head: true }),
    sb.from('exams').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Colleges',     value: colleges     ?? 0, icon: Building2,    href: '/admin/colleges',  color: 'blue'   },
    { label: 'Courses',      value: courses      ?? 0, icon: BookOpen,     href: '/admin/courses',   color: 'violet' },
    { label: 'Students',     value: students     ?? 0, icon: Users,        href: '/admin/students',  color: 'emerald'},
    { label: 'Applications', value: applications ?? 0, icon: TrendingUp,   href: '/admin/students',  color: 'amber'  },
    { label: 'Articles',     value: articles     ?? 0, icon: FileText,     href: '/admin/articles',  color: 'rose'   },
    { label: 'Exams',        value: exams        ?? 0, icon: ClipboardList,href: '/admin/exams',     color: 'cyan'   },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">GyanSanchaar admin overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className={`border rounded-xl p-5 hover:border-white/20 transition-all group ${colorMap[color]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
                <div className="text-sm mt-1 opacity-70">{label}</div>
              </div>
              <Icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/admin/colleges/new', label: '+ Add College' },
            { href: '/admin/courses/new',  label: '+ Add Course'  },
            { href: '/admin/articles/new', label: '+ New Article' },
            { href: '/admin/exams/new',    label: '+ Add Exam'    },
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
