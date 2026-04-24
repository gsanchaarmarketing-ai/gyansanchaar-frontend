import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import SafeHtml from '@/components/ui/SafeHtml'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, BookOpen, ChevronDown, ArrowRight, Share2 } from 'lucide-react'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: a } = await publicApi.article(params.slug)
    const title = `${a.meta_title ?? a.title} | GyanSanchaar`
    const description = a.meta_description ?? a.excerpt ?? ''
    return {
      title,
      description,
      alternates: { canonical: `/articles/${a.slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        ...(a.published_at ? { publishedTime: a.published_at } : {}),
        ...(a.featured_image ? { images: [{ url: a.featured_image }] } : {}),
      },
      twitter: {
        card: a.featured_image ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(a.featured_image ? { images: [a.featured_image] } : {}),
      },
    }
  } catch { return { title: 'Article Not Found' } }
}

const CAT_COLORS: Record<string, string> = {
  news: 'bg-blue-50 text-blue-700',
  guide: 'bg-violet-50 text-violet-700',
  exam_update: 'bg-orange-50 text-orange-700',
  admission_alert: 'bg-red-50 text-red-700',
  career: 'bg-green-50 text-green-700',
  scholarship: 'bg-yellow-50 text-yellow-700',
}

// Static FAQ entries per category
const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
  guide: [
    { q: 'Is this information verified?', a: 'Yes. All guides on GyanSanchaar are written by subject matter experts and reviewed for accuracy against official sources.' },
    { q: 'How often are guides updated?', a: 'Guides are reviewed and updated at the start of each admission cycle, typically in January and June.' },
  ],
  exam_update: [
    { q: 'Where does this exam information come from?', a: 'Directly from the official conducting body\'s website or press releases. We link to the official source in every article.' },
    { q: 'What if the date changes after publication?', a: 'We update articles within 24 hours of any official announcement. Check the "Last Updated" date at the top.' },
  ],
  default: [
    { q: 'Can I apply to colleges through GyanSanchaar?', a: 'Yes. GyanSanchaar lets you apply to 500+ verified colleges with a single form. No agent fees, direct to admissions.' },
    { q: 'Is GyanSanchaar free to use?', a: 'Completely free for students. We never charge students or take commissions from colleges for listings.' },
    { q: 'How do I know a college is verified?', a: 'Every college on GyanSanchaar is verified against UGC/NAAC/AICTE records before being listed. Look for the Verified badge.' },
  ],
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  let article: any
  let related: any[] = []

  try {
    const res = await publicApi.article(params.slug)
    article = res.data
  } catch { notFound() }

  try {
    const relRes = await publicApi.articles({ category: article.category, per_page: '3' })
    related = relRes.data.filter((a: any) => a.slug !== article.slug).slice(0, 3)
  } catch {}

  const faqs = CATEGORY_FAQS[article.category] ?? CATEGORY_FAQS.default
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? '',
    ...(publishedDate && { datePublished: article.published_at }),
    author: { '@type': 'Person', name: article.author?.name ?? 'GyanSanchaar Editorial' },
    publisher: { '@type': 'Organization', name: 'GyanSanchaar' },
    ...(article.featured_image && { image: article.featured_image }),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="bg-white pb-24 md:pb-0">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white py-14">
          <div className="max-w-container mx-auto px-6 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
              <Link href="/articles" className="hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Articles
              </Link>
              <span>/</span>
              <span className="text-white/70 capitalize">{article.category.replace('_', ' ')}</span>
            </div>

            {/* Category badge */}
            <div className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${CAT_COLORS[article.category] ?? 'bg-white/10 text-white'}`}>
              {article.category.replace('_', ' ')}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/50 text-xs">
              {article.author?.name && (
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {article.author.name}</span>
              )}
              {publishedDate && (
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {publishedDate}</span>
              )}
              {article.reading_time && (
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.reading_time} min read</span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Article body */}
          <article className="lg:col-span-8">
            {article.excerpt && (
              <p className="text-lg text-body leading-relaxed mb-8 pb-8 border-b border-border font-medium">
                {article.excerpt}
              </p>
            )}

            <div className="prose prose-slate prose-sm max-w-none">
              {article.body_html
                ? <SafeHtml html={article.body_html} />
                : article.body
                  ? <p className="whitespace-pre-wrap text-body leading-relaxed">{article.body}</p>
                  : <p className="text-muted italic">Content coming soon.</p>
              }
            </div>

            {/* ── FAQ Section ── */}
            <div className="mt-12 pt-10 border-t border-border">
              <h2 className="text-xl font-extrabold text-heading mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group border border-border rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-heading text-sm list-none hover:bg-slate-50 transition-colors">
                      {faq.q}
                      <ChevronDown className="w-4 h-4 text-muted shrink-0 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 text-body text-sm leading-relaxed border-t border-border bg-slate-50">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* CTA banner */}
            <div className="mt-10 bg-accent-gradient rounded-2xl p-7 text-white text-center">
              <div className="font-extrabold text-xl mb-2">Ready to apply to colleges?</div>
              <p className="text-white/70 text-sm mb-5">Join thousands of students who applied through GyanSanchaar — free, direct, zero agent fees.</p>
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-light transition-colors text-sm">
                Start Your Application <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Table of contents placeholder */}
              <div className="border border-border rounded-2xl p-5">
                <div className="font-bold text-heading text-sm mb-3">Quick Navigation</div>
                <ul className="space-y-2 text-xs text-body">
                  <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                    <span className="w-1 h-1 rounded-full bg-primary shrink-0" /> Overview
                  </li>
                  <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                    <span className="w-1 h-1 rounded-full bg-muted shrink-0" /> Key Points
                  </li>
                  <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                    <span className="w-1 h-1 rounded-full bg-muted shrink-0" /> FAQs
                  </li>
                </ul>
              </div>

              {/* Apply CTA */}
              <div className="bg-primary rounded-2xl p-5 text-white text-center">
                <div className="font-bold mb-1 text-sm">Apply to 500+ Colleges</div>
                <div className="text-white/60 text-xs mb-4">Free · Direct · No agent fees</div>
                <Link href="/register"
                  className="block bg-white text-primary font-bold text-sm py-2.5 rounded-xl hover:bg-primary-light transition-colors">
                  Start Free Application
                </Link>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="border border-border rounded-2xl p-5">
                  <div className="font-bold text-heading text-sm mb-4">Related Articles</div>
                  <div className="space-y-4">
                    {related.map(r => (
                      <Link key={r.id} href={`/articles/${r.slug}`}
                        className="group flex gap-3 items-start">
                        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-heading leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {r.title}
                          </div>
                          {r.reading_time && (
                            <div className="text-[10px] text-muted mt-1 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {r.reading_time} min
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
