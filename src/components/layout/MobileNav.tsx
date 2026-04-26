'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, BookOpen, ClipboardList, Newspaper, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/',         icon: Home,         label: 'Home'    },
  { href: '/colleges', icon: Building2,    label: 'Colleges'},
  { href: '/courses',  icon: BookOpen,     label: 'Courses' },
  { href: '/exams',    icon: ClipboardList,label: 'Exams'   },
  { href: '/articles', icon: Newspaper,    label: 'News'    },
  { href: '/dashboard',icon: User,         label: 'Profile' },
]

export default function MobileNav() {
  const path = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 flex safe-area-pb">
      {items.map(({ href, icon: Icon, label }) => {
        const active =
          path === href ||
          (href !== '/' && path.startsWith(href))
        return (
          <Link key={href} href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 text-[10px] gap-0.5 transition-colors',
              active ? 'text-primary' : 'text-slate-500 hover:text-slate-700',
            )}>
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
