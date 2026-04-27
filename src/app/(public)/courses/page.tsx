import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { Clock, IndianRupee, ChevronRight, BookOpen } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string> }): Promise<Metadata> {
  const page = Number(searchParams.page ?? 1)
  return {
    title: `Courses in India ${new Date().getFullYear()} — UG, PG, Diploma | GyanSanchaar`,
    description: 'Explore UG, PG, diploma and certificate courses across all streams. View fees, duration, eligibility and apply to colleges across Northeast India.',
    alternates: { canonical: page > 1 ? `/courses?page=${page}` : '/courses' },
    openGraph: { title: 'Courses in India | GyanSanchaar', url: `${BASE}/courses` },
  }
}
export const dynamic = 'force-dynamic'

function feeRange(course: any): string {
  if (course.fee_min && course.fee_max) {
    const min = course.fee_min >= 100000
      ? `${(course.fee_min / 100000).toFixed(1)}L`
      : `${Math.round(course.fee_min / 1000)}K`
    const max = course.fee_max >= 100000
      ? `${(course.fee_max / 100000).toFixed(1)}L`
      : `${Math.round(course.fee_max / 1000)}K`
    return `${min}–${max} INR`
  }
  if (course.default_fee) {
    return course.default_fee >= 100000
      ? `${(course.default_fee / 100000).toFixed(1)}L INR`
      : `${Math.round(course.default_fee / 1000)}K INR`
  }
  return 'Varies'
}

const LEVEL_LABELS: Record<string, string> = {
  ug: 'UG', pg: 'PG', diploma: 'Diploma',
  phd: 'PhD', certificate: 'Certificate', other: 'Other',
}

const LEVEL_COLORS: Record<string, string> = {
  ug: 'bg-blue-100 text-blue-700',
  pg: 'bg-purple-100 text-purple-700',
  diploma: 'bg-amber-100 text-amber-700',
  phd: 'bg-rose-100 text-rose-700',
  certificate: 'bg-teal-100 text-teal-700',
  other: 'bg-slate-100 text-slate-600',
}

export default async function CoursesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const [coursesRes, streamsRes] = await Promise.allSettled([
    publicApi.courses({ ...searchParams, per_page: '20' }),
    publicApi.streams(),
  ])
  const courses = coursesRes.status === 'fulfilled' ? coursesRes.value : null
  const streams = streamsRes.status === 'fulfilled' ? streamsRes.value.data : []

  const LEVELS = ['ug', 'pg', 'diploma', 'phd', 'certificate']

  const jsonLd = courses?.data.length ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Courses in India',
    numberOfItems: courses?.meta?.total ?? 0,
    itemListElement: courses.data.map((c: any, i: number) => ({
      '@type': 'ListItem', position: i + 1, name: c.name,
      url: `${BASE}/courses/${c.slug}`,
    })),
  } : null

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Header />
      <main className="pb-28 md:pb-10">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Explore</div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Courses in India</h1>
            <p className="text-white/60 text-sm">
              {courses?.meta?.total?.toLocaleString() ?? '…'} courses · UG, PG, Diploma, PhD
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Filters */}
          <form method="GET" className="flex flex-wrap gap-2 mb-6">
            <select name="level" defaultValue={searchParams.level ?? ''}
              className="border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">All Levels</option>
              {LEVELS.map(l => (
                <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
              ))}
            </select>
            <select name="stream_id" defaultValue={searchParams.stream_id ?? ''}
              className="border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">All Streams</option>
              {streams.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Search course…"
              className="border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary w-44" />
            <button type="submit"
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
              Filter
            </button>
            {(searchParams.level || searchParams.stream_id || searchParams.q) && (
              <a href="/courses" className="px-4 py-2 border border-border text-slate-600 rounded-xl text-sm hover:bg-slate-50">
                Clear
              </a>
            )}
          </form>

          {/* Cards */}
          {courses?.data.length ? (
            <div className="space-y-4">
              {courses.data.map((c: any) => {
                const durationYrs = Math.ceil((c.duration_months ?? 24) / 12)
                const colorClass = LEVEL_COLORS[c.level] ?? 'bg-slate-100 text-slate-600'

                return (
                  <div key={c.id} className="bg-white border border-border rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all">
                    {/* Top row: image + title */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-20 h-16 rounded-xl bg-primary-light border border-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {c.overview_image ? (
                          <img src={c.overview_image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-7 h-7 text-primary/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-bold text-heading text-base leading-tight">{c.name}</h2>
                          <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                            {LEVEL_LABELS[c.level] ?? c.level?.toUpperCase()}
                          </span>
                        </div>
                        {c.stream && <div className="text-xs text-muted mt-0.5">{c.stream.name}</div>}
                      </div>
                    </div>

                    {/* Stats row — full width */}
                    <div className="flex gap-2 mb-3">
                      <div className="bg-slate-50 border border-border rounded-lg px-3 py-1.5 text-xs flex-1">
                        <div className="text-muted">Average Duration</div>
                        <div className="font-bold text-heading mt-0.5">{durationYrs} {durationYrs === 1 ? 'year' : 'years'}</div>
                      </div>
                      <div className="bg-slate-50 border border-border rounded-lg px-3 py-1.5 text-xs flex-1">
                        <div className="text-muted">Average Fees</div>
                        <div className="font-bold text-heading mt-0.5">{feeRange(c)}</div>
                      </div>
                    </div>

                    {/* Description — full width */}
                    {c.description && (
                      <p className="text-body text-sm line-clamp-2 leading-relaxed mb-4">{c.description}</p>
                    )}

                    {/* CTA */}
                    <div className="border-t border-border pt-4">
                      <Link href={`/courses/${c.slug}`}
                        className="flex items-center justify-center gap-2 w-full border border-primary text-primary font-semibold text-sm py-2.5 rounded-xl hover:bg-primary-light transition-colors">
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <div className="font-semibold text-heading mb-1">No courses found</div>
              <a href="/courses" className="text-primary text-sm hover:underline">Clear filters →</a>
            </div>
          )}

          {/* Pagination */}
          {courses?.meta && courses.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {courses.meta.current_page > 1 && (
                <Link href={`/courses?${new URLSearchParams({ ...searchParams, page: String(courses.meta.current_page - 1) })}`}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:border-primary text-body">
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-muted px-3">
                Page {courses.meta.current_page} of {courses.meta.last_page}
              </span>
              {courses.meta.current_page < courses.meta.last_page && (
                <Link href={`/courses?${new URLSearchParams({ ...searchParams, page: String(courses.meta.current_page + 1) })}`}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:border-primary text-body">
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
