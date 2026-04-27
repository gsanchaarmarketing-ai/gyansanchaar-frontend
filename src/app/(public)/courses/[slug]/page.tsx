import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { publicApi, ApiError } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CourseDetailClient from '@/components/course/CourseDetailClient'
import { breadcrumbSchema } from '@/lib/seo'

export const revalidate = 300

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.course(params.slug)
    const fees = c.fee_min && c.fee_max
      ? `₹${Math.round(c.fee_min / 1000)}K–${Math.round(c.fee_max / 1000)}K/yr`
      : c.default_fee ? `₹${Math.round((c.default_fee as number) / 1000)}K/yr` : 'varies'
    const title = `${c.name} ${new Date().getFullYear()} — Fees, Eligibility, Colleges | GyanSanchaar`
    const description = `${c.name} (${c.level?.toUpperCase()}) — ${Math.ceil((c.duration_months ?? 24) / 12)} years. Average fees ${fees}. ${c.description ?? 'Apply to top colleges free on GyanSanchaar.'}`
    return {
      title, description,
      alternates: { canonical: `/courses/${c.slug}` },
      openGraph: { title, description, url: `${BASE}/courses/${c.slug}` },
    }
  } catch {
    return { title: 'Course Details | GyanSanchaar' }
  }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  let course: any = null
  try {
    const r = await publicApi.course(params.slug)
    course = r.data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    // Any other error — show not found rather than crashing
    notFound()
  }

  if (!course) notFound()

  const jsonLd = [
    breadcrumbSchema([
      { name: 'Home', url: BASE },
      { name: 'Courses', url: `${BASE}/courses` },
      { name: course.name, url: `${BASE}/courses/${course.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.name,
      description: course.description ?? `${course.name} offered by colleges across India.`,
      provider: { '@type': 'Organization', name: 'GyanSanchaar', sameAs: BASE },
      educationalLevel: course.level?.toUpperCase(),
      timeRequired: `P${Math.ceil((course.duration_months ?? 24) / 12)}Y`,
      ...(course.eligibility ? { coursePrerequisites: course.eligibility } : {}),
      ...(course.default_fee ? { offers: { '@type': 'Offer', price: course.default_fee, priceCurrency: 'INR' } } : {}),
    },
  ]

  return (
    <>
      {jsonLd.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Header />
      <CourseDetailClient course={course} />
      <MobileNav />
    </>
  )
}
