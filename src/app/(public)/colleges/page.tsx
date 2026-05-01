import type { Metadata } from 'next'
import { getColleges, getStates, getStreams } from '@/lib/supabase-api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeCard from '@/components/cards/CollegeCard'
import CollegeFilters from '@/components/forms/CollegeFilters'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>
}): Promise<Metadata> {
  const page = Number(searchParams.page ?? 1)
  // Filtered views: canonical = /colleges (no params) — consolidates thin pages
  // Paginated views (no filters): canonical = /colleges?page=N
  const hasFilters = Object.keys(searchParams).some(k => k !== 'page')
  const canonicalUrl = hasFilters
    ? '/colleges'
    : page > 1 ? `/colleges?page=${page}` : '/colleges'

  return {
    title: `Colleges in India ${new Date().getFullYear()} — Filter by State, Type, NIRF Rank | GyanSanchaar`,
    description: 'Browse and compare 500+ verified colleges across India. Filter by state, type, NIRF rank, and stream. Apply directly — zero agent fees.',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: 'Colleges in India | GyanSanchaar',
      description: 'Browse 500+ verified colleges. Apply free.',
      url: `${BASE}/colleges`,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const [collegesRes, statesRes, streamsRes] = await Promise.allSettled([
    getColleges({ q: searchParams.q, state_id: searchParams.state_id ? Number(searchParams.state_id) : undefined, type: searchParams.type, limit: 12 }),
    getStates(),
    getStreams(),
  ])

  const colleges = collegesRes.status === 'fulfilled' ? collegesRes.value : null
  const states   = statesRes.status   === 'fulfilled' ? statesRes.value   : []
  const streams  = streamsRes.status  === 'fulfilled' ? streamsRes.value  : []
  const apiDown  = collegesRes.status === 'rejected'

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">Colleges in India</h1>
        <p className="text-slate-500 text-sm mb-6">
          {colleges?.count?.toLocaleString() ?? colleges?.data?.length ?? '…'} colleges found
          {searchParams.q ? ` for "${searchParams.q}"` : ''}
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="md:w-64 flex-shrink-0">
            <CollegeFilters states={states} streams={streams} current={searchParams} />
          </aside>

          {/* Results */}
          <section className="flex-1">
            {colleges && colleges.data?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {colleges.data.map((c: any) => <CollegeCard key={c.id} college={c as any} />)}
                </div>
                {/* Pagination — TODO: implement offset-based pagination with Supabase */}
              </>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <div className="text-4xl mb-3">🏫</div>
                <div className="font-medium">{apiDown ? 'Loading colleges...' : 'No colleges found'}</div>
                <div className="text-sm mt-1">{apiDown ? 'Server is waking up — refresh in 15 seconds' : 'Try adjusting your filters'}</div>
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
