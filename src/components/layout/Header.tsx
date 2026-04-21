'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Menu, X, GraduationCap } from 'lucide-react'

const navLinks = [
  { href: '/colleges', key: 'colleges' },
  { href: '/courses', key: 'courses' },
  { href: '/exams', key: 'exams' },
  { href: '/articles', key: 'articles' },
]

interface HeaderProps {
  isLoggedIn?: boolean
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600 text-xl">
          <GraduationCap className="w-7 h-7" />
          GyanSanchaar
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(l => (
            <Link key={l.key} href={l.href}
              className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
              {t(l.key)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
              {t('dashboard')}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-brand-600 font-medium">
                {t('login')}
              </Link>
              <Link href="/register"
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                {t('register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden absolute inset-x-0 top-16 bg-white border-b shadow-lg z-40 p-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.key} href={l.href} onClick={() => setOpen(false)}
              className="block py-2 text-slate-700 font-medium border-b border-slate-100">
              {t(l.key)}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="bg-brand-600 text-white text-center py-2 rounded-lg text-sm font-medium">
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="border border-brand-600 text-brand-600 text-center py-2 rounded-lg text-sm font-medium">
                  {t('login')}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="bg-brand-600 text-white text-center py-2 rounded-lg text-sm font-medium">
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
