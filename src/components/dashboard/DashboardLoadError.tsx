'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export default function DashboardLoadError() {
  const [retrying, setRetrying] = useState(false)
  const [secs, setSecs] = useState(0)

  // Auto-retry with backoff: 3s, then poll for backend warmth
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function retry() {
    setRetrying(true)
    window.location.reload()
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-heading mb-2">Couldn't load dashboard</h1>
          <p className="text-sm text-muted mb-6">
            The server is taking longer than usual to respond — likely waking up from idle.
            You're still logged in. {secs > 0 && `(${secs}s)`}
          </p>
          <button
            onClick={retry}
            disabled={retrying}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Reloading…' : 'Try again'}
          </button>
          <div className="mt-4 text-xs text-muted">
            Still not working? <Link href="/" className="text-primary hover:underline">Go home</Link> · <Link href="/api/auth/logout" className="text-primary hover:underline">Sign out</Link>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
