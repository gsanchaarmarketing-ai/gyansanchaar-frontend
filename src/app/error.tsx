'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-extrabold text-heading mb-3">Something went wrong</h1>
      <p className="text-body text-sm mb-8">
        We couldn't load this page. This is usually temporary — please try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm">
          Try again
        </button>
        <Link href="/"
          className="border border-border text-heading px-6 py-3 rounded-xl font-semibold text-sm">
          Go Home
        </Link>
      </div>
    </main>
  )
}
