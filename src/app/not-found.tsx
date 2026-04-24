import Link from 'next/link'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-20 pb-24 text-center">
        <div className="text-7xl mb-6">🎓</div>
        <h1 className="text-3xl font-extrabold text-heading mb-3">Page not found</h1>
        <p className="text-body mb-8">
          The college, course, or page you're looking for doesn't exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/colleges"
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm">
            Browse Colleges
          </Link>
          <Link href="/"
            className="border border-border text-heading px-6 py-3 rounded-xl font-semibold text-sm">
            Go Home
          </Link>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
