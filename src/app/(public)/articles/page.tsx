import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ArticleCard from '@/components/cards/ArticleCard'

export const metadata: Metadata = {
  title: 'Education News & Guides | GyanSanchaar',
  description: 'Latest admission news, exam updates, college guides, and career articles.',
}
export const revalidate = 300

const CATS = [['','All'],['news','News'],['guide','Guides'],['exam_update','Exam Updates'],['admission_alert','Admission Alerts'],['career','Career'],['scholarship','Scholarships']]

export default async function ArticlesPage({ searchParams }: { searchParams: Record<string,string> }) {
  const res = await publicApi.articles({ ...searchParams, per_page: '12' }).catch(() => null)

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">News & Articles</h1>
        <div className="flex gap-2 flex-wrap mb-6 mt-3">
          {CATS.map(([v,l]) => (
            <a key={v} href={v ? `/articles?category=${v}` : '/articles'}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${searchParams.category === v || (!searchParams.category && !v) ? 'bg-brand-600 text-white border-brand-600' : 'hover:bg-slate-50'}`}>
              {l}
            </a>
          ))}
        </div>
        {res ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {res.data.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        ) : <div className="py-12 text-center text-slate-500">Could not load articles</div>}
      </main>
      <MobileNav />
    </>
  )
}
