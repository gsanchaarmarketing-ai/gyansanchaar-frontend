'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

type Prefs = { necessary: true; analytics: boolean; marketing: boolean }

const STORAGE_KEY = 'gs_cookie_prefs'

function getStoredPrefs(): Prefs | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storePrefs(prefs: Prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) } catch {}
}

/** Fires GTM / Meta Pixel only when consent is granted */
function applyConsent(prefs: Prefs) {
  if (typeof window === 'undefined') return
  if (prefs.analytics && process.env.NEXT_PUBLIC_GTM_ID) {
    // GTM dataLayer push — consent update
    // @ts-ignore
    window.dataLayer = window.dataLayer ?? []
    // @ts-ignore
    window.dataLayer.push({ event: 'consent_update', analytics_storage: 'granted' })
  }
  if (prefs.marketing && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
    // @ts-ignore
    if (window.fbq) window.fbq('consent', 'grant')
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showCustomise, setShowCustomise] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const stored = getStoredPrefs()
    if (!stored) {
      // Small delay so it doesn't flash on server-rendered paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    } else {
      applyConsent(stored)
    }
  }, [])

  if (!visible) return null

  const save = (prefs: Prefs) => {
    storePrefs(prefs)
    applyConsent(prefs)
    setVisible(false)
  }

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true })
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false })
  const saveCustom = () => save({ necessary: true, analytics, marketing })

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-white border border-border rounded-2xl shadow-2xl shadow-black/10 p-5"
    >
      <button
        onClick={rejectAll}
        aria-label="Close"
        className="absolute top-3 right-3 text-muted hover:text-heading transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <p className="text-xs font-bold text-heading mb-1">We use cookies 🍪</p>
      <p className="text-xs text-body leading-relaxed mb-4">
        Strictly necessary cookies are always active. We use analytics and marketing cookies only
        with your consent, as required by the{' '}
        <Link href="/privacy" className="text-primary hover:underline">DPDP Act 2023</Link>.
      </p>

      {showCustomise && (
        <div className="mb-4 space-y-2 border border-border rounded-xl p-3 text-xs">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-body">
              <strong className="text-heading">Necessary</strong> — session, auth, security
            </span>
            <span className="text-muted text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded-full">Always on</span>
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-body">
              <strong className="text-heading">Analytics</strong> — improve our platform
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={e => setAnalytics(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-body">
              <strong className="text-heading">Marketing</strong> — relevant ads
            </span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </label>
        </div>
      )}

      <div className="flex gap-2">
        {showCustomise ? (
          <button
            onClick={saveCustom}
            className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
          >
            Save preferences
          </button>
        ) : (
          <>
            <button
              onClick={acceptAll}
              className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
            >
              Accept all
            </button>
            <button
              onClick={rejectAll}
              className="flex-1 border border-border text-body text-xs font-medium py-2.5 rounded-xl hover:border-primary hover:text-primary transition-colors"
            >
              Reject all
            </button>
          </>
        )}
        <button
          onClick={() => setShowCustomise(v => !v)}
          className="border border-border text-body text-xs font-medium px-3 py-2.5 rounded-xl hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
        >
          {showCustomise ? 'Back' : 'Customise'}
        </button>
      </div>
    </div>
  )
}
