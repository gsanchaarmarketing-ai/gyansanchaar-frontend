import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeCard from '@/components/cards/CollegeCard'
import { formatFee } from '@/lib/utils'
import { Clock, IndianRupee } from 'lucide-react'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.course(params.slug)
    return { title: `${c.name} — Colleges, Fees, Eligibility | GyanSanchaar` }
  } catch { return { title: 'Course' } }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  let course
  try { const r = await publicApi.course(params.slug); course = r.data }
  catch { notFound() }

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Course',
    name: course.name,
    provider: { '@type': 'Organization', name: 'GyanSanchaar', sameAs: 'https://gyansanchaar.cloud' },
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/courses" className="hover:text-brand-600">Courses</Link>
            <span>/</span><span>{course.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration_months} months</span>
            <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" />{formatFee(course.default_fee)}/year</span>
            <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium text-xs">{course.level?.toUpperCase()}</span>
            {course.stream && <span className="text-slate-500">{course.stream.name}</span>}
          </div>
        </div>

        {course.description && (
          <div className="bg-white border rounded-xl p-5 mb-6">
            <h2 className="font-semibold mb-2">About this course</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
          </div>
        )}

        {course.eligibility && (
          <div className="bg-white border rounded-xl p-5 mb-6">
            <h2 className="font-semibold mb-2">Eligibility</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{course.eligibility}</p>
          </div>
        )}

        {course.colleges && course.colleges.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Colleges offering {course.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.colleges.map((c: any) => <CollegeCard key={c.id} college={c} />)}
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
