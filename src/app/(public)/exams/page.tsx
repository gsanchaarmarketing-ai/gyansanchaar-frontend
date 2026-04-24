import type { Metadata } from 'next'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { Calendar, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Entrance Exam Calendar 2026 — JEE, NEET, CAT, CLAT, GATE | GyanSanchaar',
  description: 'JEE, NEET, CAT, CLAT, GATE and 50+ entrance exams — dates, registration deadlines, eligibility and results in one place.',
  alternates: { canonical: '/exams' },
}
export const revalidate = 3600

export default async function ExamsPage() {
  const res = await publicApi.exams().catch(() => null)
  const exams = res?.data ?? []

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-1">Entrance Exams</h1>
        <p className="text-slate-500 text-sm mb-6">Registration dates, exam schedules, and results for all major Indian entrance exams</p>
        <div className="space-y-3">
          {exams.map((e: any) => (
            <div key={e.id} className="bg-white border rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{e.name}</h3>
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
              {e.official_website && (
                <a href={e.official_website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-600 text-xs font-medium flex-shrink-0">
                  Official site <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
          {!exams.length && <div className="py-12 text-center text-slate-500">No exam data available yet</div>}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
