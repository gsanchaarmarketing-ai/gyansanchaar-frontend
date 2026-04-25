import type { Metadata } from 'next'
import Link from 'next/link'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import { formatFee } from '@/lib/utils'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>
}): Promise<Metadata> {
  const hasFilters = Object.keys(searchParams).some(k => k !== 'page')
  const page = Number(searchParams.page ?? 1)
  const canonicalUrl = hasFilters
    ? '/courses'
    : page > 1 ? `/courses?page=${page}` : '/courses'
  return {
    title: `Courses in India ${new Date().getFullYear()} — UG, PG, Diploma | GyanSanchaar`,
    description: 'Explore UG, PG, diploma and certificate courses across all streams in India. View fees, duration, eligibility and apply to colleges.',
    alternates: { canonical: canonicalUrl },
    openGraph: { title: 'Courses in India | GyanSanchaar', url: `${BASE}/courses` },
  }
}
export const dynamic = 'force-dynamic'

export default async function CoursesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const [coursesRes, streamsRes] = await Promise.allSettled([
    publicApi.courses({ ...searchParams, per_page: '20' }),
    publicApi.streams(),
  ])
  const courses = coursesRes.status === 'fulfilled' ? coursesRes.value : null
  const streams = streamsRes.status === 'fulfilled' ? streamsRes.value.data : []
  const LEVELS = ['ug','pg','diploma','phd','certificate']

  const jsonLd = courses?.data.length ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Courses in India',
    numberOfItems: courses?.meta?.total ?? 0,
    itemListElement: courses.data.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `https://gyansanchaar.com/courses/${c.slug}`,
    })),
  } : null

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">Courses in India</h1>
        <p className="text-slate-500 text-sm mb-6">{courses?.meta?.total?.toLocaleString() ?? courses?.data?.length ?? '…'} courses found</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <form method="GET" className="flex flex-wrap gap-2">
            <select name="level" defaultValue={searchParams.level ?? ''}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <select name="stream_id" defaultValue={searchParams.stream_id ?? ''}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.short}</option>)}
            </select>
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">Apply</button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses?.data.map(c => (
            <Link key={c.id} href={`/courses/${c.slug}`}
              className="bg-white border rounded-xl p-4 hover:border-brand-400 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-brand-600 line-clamp-2">{c.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">{c.stream?.name}</div>
                </div>
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  {c.level?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration_months} months</span>
                <span className="font-medium text-slate-700">{formatFee(c.default_fee)}</span>
              </div>
              <div className="flex items-center gap-1 text-brand-600 text-xs mt-2 font-medium">
                View colleges <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {!courses?.data.length && (
          <div className="py-16 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <div className="font-medium">No courses found</div>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
