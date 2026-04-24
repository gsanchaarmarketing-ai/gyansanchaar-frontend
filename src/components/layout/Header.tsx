'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react'

const navLinks = [
  { href: '/colleges', label: 'Colleges' },
  { href: '/courses',  label: 'Courses' },
  { href: '/exams',    label: 'Exams' },
  { href: '/articles', label: 'Articles' },
]

interface HeaderProps { isLoggedIn?: boolean }

export default function Header({ isLoggedIn }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* 1440px frame / 1200px container */}
      <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo — Navbar/Main */}
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

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-medium text-body hover:text-primary transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link href="/register"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                Apply Free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-heading" /> : <Menu className="w-5 h-5 text-heading" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute inset-x-0 top-16 bg-white border-b border-border shadow-lg z-40 p-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-body hover:text-primary hover:bg-primary-light rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}
              className="border border-border text-center py-2.5 rounded-lg text-sm font-medium text-body">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}
              className="bg-primary text-white text-center py-2.5 rounded-lg text-sm font-semibold">
              Apply Free →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
