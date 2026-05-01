'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react'

export default function FirstVisitModal({ profileComplete }: { profileComplete: boolean }) {
  const [open, setOpen] = useState(!profileComplete)

  if (!open || profileComplete) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 relative">
          <button onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold mb-1">One step before you apply!</h2>
          <p className="text-white/75 text-sm">
            Complete your profile once — then apply to any college with just one tap.
          </p>
        </div>

        {/* What's needed */}
        <div className="p-6">
          <div className="space-y-2.5 mb-5">
            {[
              "Father's name & alternate contact",
              'Email ID & complete address',
              'Which course you want to apply for',
              '10th and 12th marksheets',
            ].map(s => (
              <div key={s} className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {s}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mb-5">
            Takes under 5 minutes. Apply to unlimited colleges after.
          </p>

          <div className="flex gap-3">
            <button onClick={() => setOpen(false)}
              className="flex-1 border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              Later
            </button>
            <Link href="/dashboard/application" onClick={() => setOpen(false)}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors">
              Complete Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
