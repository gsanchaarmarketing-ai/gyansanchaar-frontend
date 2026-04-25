'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'gs_dashboard_seen_v1'

export default function FirstVisitModal({ profileComplete }: { profileComplete: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only show if profile is incomplete AND user hasn't dismissed before
    if (profileComplete) return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setOpen(true)
  }, [profileComplete])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-6 relative">
          <button onClick={dismiss} className="absolute top-3 right-3 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold mb-1">Complete your application profile</h2>
          <p className="text-white/80 text-sm">Fill it once, apply to any college with one tap.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {[
              "Father's name & contact details",
              'Address & state',
              'Academic level (UG / PG / PhD / Diploma)',
              '10th, 12th & graduation marksheets',
            ].map(s => (
              <div key={s} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-body">{s}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">Takes under 5 minutes. You can apply to colleges immediately after.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={dismiss}
              className="flex-1 border border-border text-body py-2.5 rounded-xl text-sm font-medium">
              Maybe Later
            </button>
            <Link href="/dashboard/application" onClick={dismiss}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1">
              Start Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
