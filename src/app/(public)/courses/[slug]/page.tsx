import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { publicApi, type Course, ApiError } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeCard from '@/components/cards/CollegeCard'
import { formatFee } from '@/lib/utils'
import { Clock, IndianRupee, GraduationCap, CheckCircle, BookOpen } from 'lucide-react'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.course(params.slug)
    const title = `${c.name} — Colleges, Fees, Eligibility ${new Date().getFullYear()} | GyanSanchaar`
    const description = `${c.name} (${c.level?.toUpperCase()}) — ${c.duration_months} months. Fees from ${c.default_fee ? '₹' + Math.round(c.default_fee / 1000) + 'K/yr' : 'varies'}. Apply to top colleges free.`
    return {
      title, description,
      alternates: { canonical: `/courses/${c.slug}` },
      openGraph: { title, description },
    }
  } catch {
    return { title: 'Course Details | GyanSanchaar' }
  }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  let course: Course | null = null

  try {
    const r = await publicApi.course(params.slug)
    course = r.data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  if (!course) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description ?? `${course.name} offered by colleges across India.`,
    provider: { '@type': 'Organization', name: 'GyanSanchaar', sameAs: 'https://gyansanchaar.com' },
    educationalLevel: course.level?.toUpperCase(),
    timeRequired: `P${Math.round((course.duration_months ?? 24) / 12)}Y`,
    ...(course.eligibility ? { coursePrerequisites: course.eligibility } : {}),
    ...(course.default_fee ? { offers: { '@type': 'Offer', price: course.default_fee, priceCurrency: 'INR' } } : {}),
  }

  const colleges = (course as any).colleges ?? []

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted mb-4">
          <Link href="/courses" className="hover:text-primary">Courses</Link>
          <span>/</span>
          <span>{course.name}</span>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-primary rounded-2xl p-6 text-white mb-6">
          <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase">
            {course.level}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">{course.name}</h1>
          <div className="flex flex-wrap gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.duration_months} months</span>
            <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4" />{formatFee(course.default_fee)}/year</span>
            {course.stream && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{course.stream.name}</span>}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {course.description && (
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="font-bold text-heading mb-3">About this Course</h2>
                <p className="text-body text-sm leading-relaxed">{course.description}</p>
              </section>
            )}

            {course.eligibility && (
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="font-bold text-heading mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" /> Eligibility
                </h2>
                <p className="text-body text-sm leading-relaxed whitespace-pre-line">{course.eligibility}</p>
              </section>
            )}

            {colleges.length > 0 && (
              <section>
                <h2 className="font-bold text-heading text-lg mb-4">
                  Colleges offering {course.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {colleges.map((c: any) => <CollegeCard key={c.id} college={c} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-bold text-heading mb-4">Course Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Level', course.level?.toUpperCase()],
                  ['Duration', `${course.duration_months} months`],
                  ['Annual Fee', formatFee(course.default_fee)],
                  ['Stream', course.stream?.name ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted">{k}</span>
                    <span className="font-semibold text-heading">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register"
              className="block bg-primary text-white text-center font-bold py-3 rounded-xl text-sm hover:bg-primary-hover transition-colors">
              Apply to colleges →
            </Link>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
