import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import SafeHtml from '@/components/ui/SafeHtml'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: a } = await publicApi.article(params.slug)
    return {
      title: a.meta_title ?? `${a.title} | GyanSanchaar`,
      description: a.meta_description ?? a.excerpt ?? '',
      openGraph: { title: a.title, description: a.excerpt ?? '', images: a.featured_image ? [a.featured_image] : [] },
    }
  } catch { return { title: 'Article' } }
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  let article
  try { const r = await publicApi.article(params.slug); article = r.data }
  catch { notFound() }

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: { '@type': 'Person', name: article.author?.name ?? 'GyanSanchaar' },
    datePublished: article.published_at,
    publisher: { '@type': 'Organization', name: 'GyanSanchaar' },
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="mb-2 text-xs font-medium text-brand-600 uppercase tracking-wide">
          {article.category?.replace(/_/g,' ')}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
          <span>By {article.author?.name ?? 'GyanSanchaar'}</span>
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>}
          {article.reading_time && <span>{article.reading_time} min read</span>}
        </div>
        {article.featured_image && (
          <img src={article.featured_image} alt={article.title} className="w-full rounded-xl mb-6 max-h-80 object-cover" />
        )}
        {article.excerpt && (
          <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium border-l-4 border-brand-300 pl-4">{article.excerpt}</p>
        )}
        <div className="prose prose-slate prose-sm max-w-none">
          {article.body_html
            ? <SafeHtml html={article.body_html} />
            : <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{article.body}</p>}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
