'use client'

import Link from 'next/link'
import { GraduationCap, Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '/colleges',  label: 'Colleges' },
  { href: '/courses',   label: 'Courses'  },
  { href: '/exams',     label: 'Exams'    },
  { href: '/articles',  label: 'News'     },
]

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('gs_token='))
    setIsLoggedIn(hasToken)
  }, [])


  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-heading text-lg tracking-tight">GyanSanchaar</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="px-3 py-2 text-sm font-medium text-body hover:text-primary hover:bg-primary-light rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link href="/search"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-body hover:text-primary hover:bg-primary-light transition-all"
            aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard/notifications"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-body hover:text-primary hover:bg-primary-light transition-all"
                aria-label="Notifications">
                <Bell className="w-4 h-4" />
              </Link>
              <Link href="/dashboard"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Dashboard
              </Link>
            </>
          ) : (
            <Link href="/register"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
              Apply Free →
            </Link>
          )}
        </div>

        {/* Mobile actions — Search icon + single CTA only */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/search"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-body hover:text-primary"
            aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
              Dashboard
            </Link>
          ) : (
            <Link href="/register"
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
              Apply Free
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
