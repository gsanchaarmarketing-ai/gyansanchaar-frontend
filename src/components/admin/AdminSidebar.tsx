'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap, Building2, BookOpen, FileText, ClipboardList,
  Users, Image, Settings, LogOut, LayoutDashboard, ChevronRight,
  AlertCircle, UserCheck, UsersRound, CalendarCheck
} from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/applications',   icon: CalendarCheck,   label: 'Applications' },
  { href: '/admin/colleges',       icon: Building2,       label: 'Colleges'     },
  { href: '/admin/courses',        icon: BookOpen,        label: 'Courses'      },
  { href: '/admin/exams',          icon: ClipboardList,   label: 'Exams'        },
  { href: '/admin/articles',       icon: FileText,        label: 'Articles'     },
  { href: '/admin/students',       icon: Users,           label: 'Students'     },
  { href: '/admin/grievances',     icon: AlertCircle,     label: 'Grievances'   },
  { href: '/admin/team',           icon: UsersRound,      label: 'Team'         },
  { href: '/admin/media',          icon: Image,           label: 'Media Logos'  },
  { href: '/admin/settings',       icon: Settings,        label: 'Site Content' },
]

export default function AdminSidebar({ role, name, email }: { role: string; name: string; email: string }) {
  const path   = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await createBrowserSupabaseClient().auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0a0c10]">
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white leading-none">GyanSanchaar</div>
            <div className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Admin Console</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/admin' ? path === '/admin' : path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/5">
        <div className="px-3 py-2 rounded-lg bg-white/5 mb-2">
          <div className="text-xs font-medium text-white truncate">{name}</div>
          <div className="text-[10px] text-white/30 truncate">{email}</div>
          <div className="text-[9px] text-blue-400 uppercase tracking-wider mt-0.5">{role.replace('_',' ')}</div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-3.5 h-3.5" />Sign out
        </button>
      </div>
    </aside>
  )
}
