import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeCard from '@/components/cards/CollegeCard'
import CollegeFilters from '@/components/forms/CollegeFilters'

export const metadata: Metadata = {
  title: 'Colleges in India — Filter by State, Type, Stream',
  description: 'Browse and compare thousands of colleges across India. Filter by state, type, NIRF rank, and stream.',
}

export const revalidate = 300

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const [collegesRes, statesRes, streamsRes] = await Promise.allSettled([
    publicApi.colleges({ ...searchParams, per_page: '12' }),
    publicApi.states(),
    publicApi.streams(),
  ])

  const colleges = collegesRes.status === 'fulfilled' ? collegesRes.value : null
  const states   = statesRes.status   === 'fulfilled' ? statesRes.value.data : []
  const streams  = streamsRes.status  === 'fulfilled' ? streamsRes.value.data : []

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">Colleges in India</h1>
        <p className="text-slate-500 text-sm mb-6">
          {colleges?.meta.total.toLocaleString() ?? '…'} colleges found
          {searchParams.q ? ` for "${searchParams.q}"` : ''}
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="md:w-64 flex-shrink-0">
            <CollegeFilters states={states} streams={streams} current={searchParams} />
          </aside>

          {/* Results */}
          <section className="flex-1">
            {colleges && colleges.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {colleges.data.map(c => <CollegeCard key={c.id} college={c} />)}
                </div>
                {/* Pagination */}
                {colleges.meta.last_page > 1 && (
                  <div className="mt-6 flex justify-center gap-2 text-sm">
                    {Array.from({ length: colleges.meta.last_page }, (_, i) => i + 1).map(p => (
                      <a key={p}
                        href={`/colleges?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                        className={`px-3 py-1.5 rounded border ${
                          p === colleges.meta.current_page
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'hover:bg-slate-50'
                        }`}>
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <div className="text-4xl mb-3">🏫</div>
                <div className="font-medium">No colleges found</div>
                <div className="text-sm mt-1">Try adjusting your filters</div>
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
