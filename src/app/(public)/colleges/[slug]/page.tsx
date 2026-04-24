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
    const title = `${c.name} — Admissions ${new Date().getFullYear()}, Courses, Fees | GyanSanchaar`
    const description = `${c.name} in ${c.city}${c.state ? ', ' + c.state.name : ''}. NIRF Rank: ${c.nirf_rank ?? 'N/A'}. NAAC: ${c.naac_grade ?? 'N/A'}. View courses, fees, eligibility and apply directly — zero agent fees.`
    return {
      title,
      description,
      alternates: { canonical: `/colleges/${c.slug}` },
      openGraph: {
        title,
        description,
        type: 'website',
        ...(c.logo_path ? { images: [{ url: c.logo_path }] } : {}),
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
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
    url: college.website ?? `https://gyansanchaar.com/colleges/${college.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city,
      addressRegion: college.state?.name ?? '',
      addressCountry: 'IN',
    },
    ...(college.contact_email ? { email: college.contact_email } : {}),
    ...(college.nirf_rank ? { award: `NIRF Rank ${college.nirf_rank}` } : {}),
    ...(college.naac_grade ? { description: `NAAC Grade ${college.naac_grade}` } : {}),
    ...(college.logo_path ? { logo: college.logo_path } : {}),
    sameAs: college.website ? [college.website] : [],
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
