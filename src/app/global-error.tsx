'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>A critical error occurred. Please try again.</p>
          <button onClick={reset}
            style={{ background: '#1d4ed8', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
