import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi, type Counsellor } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Star, Clock, BadgeCheck, MessageCircle, Shield, GraduationCap, Languages } from 'lucide-react'

interface Props { params: { slug: string } }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.counsellor(params.slug)
    const title = `${c.name} — Free College Counselling | GyanSanchaar`
    const desc = `Book a free session with ${c.name}${c.specialisation ? `, specialising in ${c.specialisation}` : ''}. ${c.experience_years ?? ''} years experience. Verified. Zero commission.`
    return {
      title,
      description: desc,
      alternates: { canonical: `/counsellors/${params.slug}` },
      openGraph: { title, description: desc },
    }
  } catch {
    return { title: 'Counsellor | GyanSanchaar' }
  }
}

export default async function CounsellorDetailPage({ params }: Props) {
  let counsellor: Counsellor
  try {
    const r = await publicApi.counsellor(params.slug)
    counsellor = r.data
  } catch {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: counsellor.name,
    jobTitle: counsellor.specialisation ?? 'College Admissions Counsellor',
    worksFor: { '@type': 'Organization', name: 'GyanSanchaar', url: 'https://gyansanchaar.com' },
    ...(counsellor.rating_avg ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: counsellor.rating_avg, reviewCount: counsellor.rating_count } } : {}),
  }

  const initials = counsellor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="text-xs text-muted mb-4">
          <Link href="/counsellors" className="hover:text-primary">← All Counsellors</Link>
        </div>

        {/* Hero */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-extrabold text-2xl flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-extrabold text-heading">{counsellor.name}</h1>
                {counsellor.specialisation && (
                  <p className="text-body text-sm mt-0.5">{counsellor.specialisation}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-body">
              {counsellor.experience_years && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {counsellor.experience_years} years experience
                </span>
              )}
              {counsellor.rating_avg && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  {counsellor.rating_avg} ({counsellor.rating_count} reviews)
                </span>
              )}
              {counsellor.languages?.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-primary" />
                  {counsellor.languages.join(', ')}
                </span>
              )}
            </div>

            {counsellor.bio && (
              <p className="text-body text-sm leading-relaxed mt-3">{counsellor.bio}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* What to expect */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-4">What to expect in your session</h2>
              <ul className="space-y-3 text-sm text-body">
                {[
                  'Personalised college shortlist based on your scores, budget, and goals',
                  'Honest comparison of courses and career outcomes',
                  'Step-by-step admission roadmap for your target colleges',
                  'Guidance on entrance exams and application timelines',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust */}
            <div className="bg-primary-light border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-heading text-sm">Zero commission guarantee</h2>
              </div>
              <p className="text-body text-xs leading-relaxed">
                GyanSanchaar counsellors do not receive referral fees from any college. Their advice is
                based solely on what is best for you. This is verified and audited quarterly.
              </p>
            </div>
          </div>

          {/* Booking panel */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="text-center mb-4">
                <div className="text-2xl font-extrabold text-heading">Free</div>
                <div className="text-muted text-xs">30-minute session</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-body mb-4">
                <Clock className="w-3.5 h-3.5 text-muted" />
                Sessions via video call · Weekdays 10 AM–6 PM IST
              </div>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Book Free Slot
              </Link>
              <p className="text-center text-muted text-xs mt-3">No credit card. No sign-up fee.</p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5 text-xs text-body space-y-2">
              <div className="font-semibold text-heading text-sm mb-2">Included in every session</div>
              {['College shortlist PDF', 'Exam calendar', 'Application checklist'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
