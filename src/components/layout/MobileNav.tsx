'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, BookOpen, ClipboardList, User, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/',                          icon: Home,         label: 'Home' },
  { href: '/colleges',                  icon: Building2,    label: 'Colleges' },
  { href: '/courses',                   icon: BookOpen,     label: 'Courses' },
  { href: '/exams',                     icon: ClipboardList,label: 'Exams' },
  { href: '/dashboard/notifications',   icon: Bell,         label: 'Updates' },
  { href: '/dashboard',                 icon: User,         label: 'Profile' },
]

export default function MobileNav() {
  const path = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 flex">
      {items.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 text-[10px] gap-0.5 transition-colors',
            path === href || (href !== '/' && path.startsWith(href))
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700',
          )}>
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
