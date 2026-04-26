import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Search, Building2, BookOpen, FileText, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>
}): Promise<Metadata> {
  const q = searchParams.q?.trim() ?? ''
  const title = q
    ? `"${q}" — Search Results | GyanSanchaar`
    : 'Search Colleges, Courses & Articles | GyanSanchaar'
  const desc = q
    ? `Search results for "${q}" — colleges, courses and articles on GyanSanchaar.`
    : 'Search thousands of verified colleges, courses, and exam guides across India.'

  return {
    title,
    description: desc,
    // Search results pages must never be canonical — noindex to avoid thin content
    robots: { index: false, follow: true },
    alternates: { canonical: `${BASE}/search` },
  }
}

interface TabResult {
  colleges: any[]
  courses:  any[]
  articles: any[]
  total:    number
}

async function fetchAll(q: string): Promise<TabResult> {
  if (!q.trim()) return { colleges: [], courses: [], articles: [], total: 0 }

  const params = { q, per_page: '6' }

  const [collegesRes, coursesRes, articlesRes] = await Promise.allSettled([
    publicApi.colleges(params),
    publicApi.courses(params),
    publicApi.articles(params),
  ])

  const colleges = collegesRes.status === 'fulfilled' ? collegesRes.value.data : []
  const courses  = coursesRes.status  === 'fulfilled' ? coursesRes.value.data  : []
  const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : []

  return { colleges, courses, articles, total: colleges.length + courses.length + articles.length }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const q    = (searchParams.q ?? '').trim()
  const tab  = (searchParams.tab ?? 'all') as 'all' | 'colleges' | 'courses' | 'articles'
  const data = await fetchAll(q)

  const tabs = [
    { key: 'all',      label: 'All',      count: data.total },
    { key: 'colleges', label: 'Colleges', count: data.colleges.length },
    { key: 'courses',  label: 'Courses',  count: data.courses.length },
    { key: 'articles', label: 'Articles', count: data.articles.length },
  ]

  function tabHref(key: string) {
    const p = new URLSearchParams({ q, tab: key })
    return `/search?${p}`
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-10">

        {/* Search bar */}
        <form method="GET" action="/search" className="flex w-full mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="Search colleges, courses, articles…"
              className="w-full pl-10 pr-4 py-3 rounded-l-xl border border-border text-sm outline-none focus:border-primary bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white px-5 rounded-r-xl font-semibold text-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Header row */}
        {q && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-heading">
              {data.total > 0
                ? `${data.total} results for "${q}"`
                : `No results for "${q}"`}
            </h1>
          </div>
        )}

        {/* Tabs */}
        {q && (
          <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
            {tabs.map(t => (
              <Link
                key={t.key}
                href={tabHref(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-heading'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                    {t.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Empty / no query state */}
        {!q && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-heading mb-2">Search GyanSanchaar</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Find colleges by name or city, browse courses by stream, or read exam guides.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Engineering colleges Assam', 'MBA courses', 'JEE 2025', 'Nursing colleges'].map(hint => (
                <Link
                  key={hint}
                  href={`/search?q=${encodeURIComponent(hint)}`}
                  className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm text-body hover:border-primary hover:text-primary transition-all"
                >
                  {hint}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {q && data.total === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-lg font-semibold text-heading mb-2">Nothing found for "{q}"</h2>
            <p className="text-slate-500 text-sm mb-6">Try a shorter term, a city name, or a course name.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/colleges" className="text-primary text-sm hover:underline">Browse all colleges →</Link>
              <Link href="/courses"  className="text-primary text-sm hover:underline">Browse all courses →</Link>
              <Link href="/exams"    className="text-primary text-sm hover:underline">Browse all exams →</Link>
            </div>
          </div>
        )}

        {/* Results */}
        {q && data.total > 0 && (
          <div className="space-y-8">

            {/* Colleges */}
            {(tab === 'all' || tab === 'colleges') && data.colleges.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-heading flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Colleges
                  </h2>
                  {tab === 'all' && (
                    <Link href={tabHref('colleges')} className="text-primary text-xs hover:underline">
                      View all →
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {data.colleges.map((c: any) => (
                    <Link key={c.id} href={`/colleges/${c.slug}`}
                      className="flex items-center justify-between bg-white border border-border rounded-xl p-4 hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {c.logo_path ? (
                          <img src={c.logo_path} alt={c.name} className="w-10 h-10 rounded-lg object-contain border bg-white flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-heading truncate">{c.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {c.city}{c.state?.name ? `, ${c.state.name}` : ''}
                            {c.nirf_rank ? ` · NIRF #${c.nirf_rank}` : ''}
                            {c.naac_grade ? ` · NAAC ${c.naac_grade}` : ''}
                          </div>
                          {c.ugc_verified && (
                            <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-1">
                              ✓ UGC Recognised
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                    </Link>
                  ))}
                </div>
                {tab === 'all' && (
                  <Link href={`/colleges?q=${encodeURIComponent(q)}`}
                    className="mt-3 block text-center text-sm text-primary hover:underline">
                    See all college results for "{q}" →
                  </Link>
                )}
              </section>
            )}

            {/* Courses */}
            {(tab === 'all' || tab === 'courses') && data.courses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-heading flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" /> Courses
                  </h2>
                  {tab === 'all' && (
                    <Link href={tabHref('courses')} className="text-primary text-xs hover:underline">
                      View all →
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {data.courses.map((c: any) => (
                    <Link key={c.id} href={`/courses/${c.slug}`}
                      className="flex items-center justify-between bg-white border border-border rounded-xl p-4 hover:border-primary transition-all group"
                    >
                      <div>
                        <div className="font-semibold text-sm text-heading">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.level?.toUpperCase()} · {Math.ceil(c.duration_months / 12)} yr
                          {c.stream?.name ? ` · ${c.stream.name}` : ''}
                          {c.default_fee ? ` · ₹${(c.default_fee / 1000).toFixed(0)}K/yr` : ''}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                    </Link>
                  ))}
                </div>
                {tab === 'all' && (
                  <Link href={`/courses?q=${encodeURIComponent(q)}`}
                    className="mt-3 block text-center text-sm text-primary hover:underline">
                    See all course results for "{q}" →
                  </Link>
                )}
              </section>
            )}

            {/* Articles */}
            {(tab === 'all' || tab === 'articles') && data.articles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-heading flex items-center gap-2">
                    <FileText className="w-4 h-4 text-warning" /> Articles & Guides
                  </h2>
                  {tab === 'all' && (
                    <Link href={tabHref('articles')} className="text-primary text-xs hover:underline">
                      View all →
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {data.articles.map((a: any) => (
                    <Link key={a.id} href={`/articles/${a.slug}`}
                      className="flex items-center justify-between bg-white border border-border rounded-xl p-4 hover:border-primary transition-all group"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-heading truncate">{a.title}</div>
                        {a.excerpt && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.excerpt}</div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1 capitalize">
                          {a.category?.replace(/_/g, ' ')}
                          {a.published_at ? ` · ${new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                    </Link>
                  ))}
                </div>
                {tab === 'all' && (
                  <Link href={`/articles?q=${encodeURIComponent(q)}`}
                    className="mt-3 block text-center text-sm text-primary hover:underline">
                    See all article results for "{q}" →
                  </Link>
                )}
              </section>
            )}

          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
