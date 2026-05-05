import { getAdmissionYear } from '@/lib/admission-year'
import type { Metadata } from 'next'
import { getExams } from '@/lib/supabase-api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: `Entrance Exam Calendar ${getAdmissionYear()} — JEE, NEET, CAT, CLAT, GATE | GyanSanchaar`,
  description: 'JEE, NEET, CAT, CLAT, GATE and 50+ entrance exams — dates, registration deadlines, eligibility and results in one place.',
  alternates: { canonical: '/exams' },
}
export const dynamic = 'force-dynamic'

export default async function ExamsPage() {
  const res = { data: await getExams().catch(() => []) }
  const exams = res?.data ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Indian Entrance Exams',
    itemListElement: exams.map((e: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.name,
      url: `https://gyansanchaar.com/exams/${e.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">Entrance Exams</h1>
        <p className="text-slate-500 text-sm mb-6">Registration dates, exam schedules, and results for all major Indian entrance exams</p>
        <div className="space-y-3">
          {exams.map((e: any) => (
            <Link key={e.id} href={`/exams/${e.slug}`}
              className="bg-white border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-brand-400 transition-colors block">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">{e.name}</h2>
                  {e.short_name && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{e.short_name}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.level === 'national' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {e.level}
                  </span>
                </div>
                {e.conducting_body && <div className="text-xs text-slate-500 mt-0.5">By {e.conducting_body}</div>}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
                  {e.registration_start && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Reg: {new Date(e.registration_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                  {e.exam_date && <span className="flex items-center gap-1 font-medium text-brand-600"><Calendar className="w-3 h-3" />Exam: {new Date(e.exam_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
                  {e.result_date && <span>Result: {new Date(e.result_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
            </Link>
          ))}
          {!exams.length && <div className="py-12 text-center text-slate-500">No exam data available yet</div>}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
