import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { BookOpen, Clock, ArrowRight, Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Education News, Guides & Admission Alerts 2026 | GyanSanchaar',
  description: 'Latest admission news, exam updates, college guides, and career articles for Indian students.',
  alternates: { canonical: '/articles' },
}
export const revalidate = 300

const CATS = [
  ['', 'All'],
  ['news', 'News'],
  ['guide', 'Guides'],
  ['exam_update', 'Exam Updates'],
  ['admission_alert', 'Admission Alerts'],
  ['career', 'Career'],
  ['scholarship', 'Scholarships'],
]

const CAT_COLORS: Record<string, string> = {
  news: 'bg-blue-50 text-blue-700',
  guide: 'bg-violet-50 text-violet-700',
  exam_update: 'bg-orange-50 text-orange-700',
  admission_alert: 'bg-red-50 text-red-700',
  career: 'bg-green-50 text-green-700',
  scholarship: 'bg-yellow-50 text-yellow-700',
}

export default async function ArticlesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const res = await publicApi.articles({ ...searchParams, per_page: '12' }).catch(() => null)
  const articles = res?.data ?? []
  const activecat = searchParams.category ?? ''

  return (
    <>
      <Header />
      <main className="bg-white pb-24 md:pb-0">

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white py-14">
          <div className="max-w-container mx-auto px-6 text-center">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Knowledge Hub</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              News &amp; Articles
            </h1>
            <p className="text-white/70 text-lg max-w-lg mx-auto">
              Admission alerts, exam guides, career tips and college news — curated for Indian students.
            </p>
          </div>
        </section>

        {/* Category filter strip */}
        <div className="border-b border-border bg-white sticky top-16 z-30">
          <div className="max-w-container mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {CATS.map(([val, label]) => (
              <Link key={val}
                href={val ? `/articles?category=${val}` : '/articles'}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border
                  ${activecat === val
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-body hover:border-primary hover:text-primary'
                  }`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-container mx-auto px-6 py-12">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-body">No articles found. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Featured: first article big */}
              {articles[0] && (
                <Link href={`/articles/${articles[0].slug}`}
                  className="group mb-10 grid md:grid-cols-2 gap-0 border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all block">
                  <div className="h-52 md:h-full bg-gradient-to-br from-primary-light to-indigo-100 flex items-center justify-center min-h-[200px]">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${CAT_COLORS[articles[0].category] ?? 'bg-slate-100 text-body'}`}>
                      {articles[0].category.replace('_', ' ')}
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-heading leading-snug mb-3 group-hover:text-primary transition-colors">
                      {articles[0].title}
                    </h2>
                    {articles[0].excerpt && (
                      <p className="text-body text-sm leading-relaxed mb-5 line-clamp-3">{articles[0].excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        {articles[0].author?.name ?? 'GyanSanchaar'}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid: remaining articles — Card/Blog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.slice(1).map(a => (
                  <Link key={a.id} href={`/articles/${a.slug}`}
                    className="group bg-white border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col">
                    {/* Image area */}
                    <div className="h-40 bg-gradient-to-br from-primary-light to-indigo-50 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary/30" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3 self-start ${CAT_COLORS[a.category] ?? 'bg-slate-100 text-body'}`}>
                        {a.category.replace('_', ' ')}
                      </div>
                      <h3 className="font-bold text-heading text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="text-muted text-xs leading-relaxed mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted mt-4 pt-3 border-t border-border">
                        <span>{a.author?.name ?? 'GyanSanchaar'}</span>
                        {a.reading_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {a.reading_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
