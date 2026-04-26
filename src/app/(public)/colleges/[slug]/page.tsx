import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi, ApiError } from '@/lib/api'
import { getCmsContent } from '@/lib/cms'
import { collegeSchema, breadcrumbSchema, faqSchema } from '@/lib/seo'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeDetailClient from '@/components/college/CollegeDetailClient'

export const revalidate = 300

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.college(params.slug)
    const year  = new Date().getFullYear()
    const title = `${c.name} — Admissions ${year}, Courses & Fees | GyanSanchaar`
    const desc  = [
      `${c.name} in ${c.city}${c.state ? ', ' + c.state.name : ''}.`,
      c.nirf_rank  ? `NIRF Rank ${c.nirf_rank}.` : '',
      c.naac_grade ? `NAAC Grade ${c.naac_grade}.` : '',
      c.ugc_verified ? 'UGC Approved.' : '',
      `Apply directly — zero agent fees. Free on GyanSanchaar.`,
    ].filter(Boolean).join(' ')

    const keywords = [
      c.name, `${c.name} admission ${year}`, `${c.name} fees`,
      `${c.name} courses`, `colleges in ${c.city}`,
      c.state?.name ? `colleges in ${c.state.name}` : '',
      'free college application', 'GyanSanchaar',
    ].filter(Boolean)

    const ogImage = c.logo_path || '/og-default.png'
    const canonical = `/colleges/${c.slug}`

    return {
      title,
      description: desc,
      keywords,
      alternates: { canonical },
      openGraph: {
        title, description: desc, type: 'website',
        url: `${BASE}/colleges/${c.slug}`,
        siteName: 'GyanSanchaar',
        images: [{ url: ogImage, width: 1200, height: 630, alt: `${c.name} — GyanSanchaar` }],
        locale: 'en_IN',
      },
      twitter: {
        card: 'summary_large_image', title, description: desc,
        images: [ogImage], site: '@gyansanchaar',
      },
      other: { 'og:locale:alternate': 'hi_IN' },
    }
  } catch {
    return { title: 'College Details | GyanSanchaar' }
  }
}

export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  let college: any = null

  try {
    const res = await publicApi.college(params.slug)
    college = res.data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  if (!college) notFound()

  const content = await getCmsContent('college').catch(() => ({} as Record<string, string>))

  // Structured data
  const schemas = [
    collegeSchema(college),
    breadcrumbSchema([
      { name: 'Home',     url: '/' },
      { name: 'Colleges', url: '/colleges' },
      { name: college.name, url: `/colleges/${college.slug}` },
    ]),
    // College-specific FAQ schema for AEO
    faqSchema([
      { q: `How do I apply to ${college.name}?`,          a: `Apply to ${college.name} for free through GyanSanchaar in under 10 minutes. No agent fees, no commissions.` },
      { q: `What courses does ${college.name} offer?`,    a: college.courses?.map((c: any) => c.name).join(', ') || `${college.name} offers multiple undergraduate and postgraduate programmes. Browse the full list above.` },
      { q: `What is the NIRF rank of ${college.name}?`,   a: college.nirf_rank ? `${college.name} holds NIRF Rank ${college.nirf_rank}.` : `NIRF ranking data for ${college.name} is not yet available.` },
      { q: `Is ${college.name} NAAC accredited?`,         a: college.naac_grade ? `Yes. ${college.name} has a NAAC Grade of ${college.naac_grade}.` : `NAAC accreditation details for ${college.name} are not yet listed.` },
    ]),
  ]

  return (
    <>
      <Header />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <CollegeDetailClient college={college} content={content} />
      <MobileNav />
    </>
  )
}
