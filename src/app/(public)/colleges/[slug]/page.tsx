import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeDetailClient from '@/components/college/CollegeDetailClient'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.college(params.slug)
    return {
      title: `${c.name} — Admissions, Courses, Fees | GyanSanchaar`,
      description: `${c.name} in ${c.city}. NIRF Rank: ${c.nirf_rank ?? 'N/A'}. View courses, fees, placements and admission process.`,
    }
  } catch { return { title: 'College Not Found' } }
}

export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  let college: any
  try {
    const res = await publicApi.college(params.slug)
    college = res.data
  } catch { notFound() }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: college.name,
    address: { '@type': 'PostalAddress', addressLocality: college.city, addressCountry: 'IN' },
    ...(college.nirf_rank && { award: `NIRF Rank ${college.nirf_rank}` }),
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CollegeDetailClient college={college} />
      <MobileNav />
    </>
  )
}
