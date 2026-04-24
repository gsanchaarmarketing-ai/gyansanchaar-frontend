'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [countdown, setCountdown] = useState(15)
  const isTimeout = error.name === 'AbortError' || error.message?.includes('abort') || error.message?.includes('timeout')

  useEffect(() => {
    console.error(error)
  }, [error])

  // Auto-retry on timeout
  useEffect(() => {
    if (!isTimeout) return
    if (countdown <= 0) { reset(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [isTimeout, countdown, reset])

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">{isTimeout ? '⏳' : '⚠️'}</div>
      <h1 className="text-2xl font-extrabold text-heading mb-3">
        {isTimeout ? 'Server is waking up...' : 'Something went wrong'}
      </h1>
      <p className="text-body text-sm mb-8">
        {isTimeout
          ? `The server was sleeping and needs a moment to wake up. Auto-retrying in ${countdown}s...`
          : 'We couldn\'t load this page. Please try again.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm">
          {isTimeout ? `Retry now (${countdown}s)` : 'Try again'}
        </button>
        <Link href="/"
          className="border border-border text-heading px-6 py-3 rounded-xl font-semibold text-sm">
          Go Home
        </Link>
      </div>
    </main>
  )
}
