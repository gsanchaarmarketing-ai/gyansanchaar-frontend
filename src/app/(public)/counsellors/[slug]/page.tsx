import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi, type Counsellor } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Star, Clock, Users, Shield, CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import Image from 'next/image'

interface Props { params: { slug: string } }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.counsellor(params.slug)
    const title = `${c.name} — College Counsellor | GyanSanchaar`
    const desc = c.bio ?? `Book a free session with ${c.name}, a verified college counsellor specialising in ${c.specialisation ?? 'admissions'}.`
    return {
      title,
      description: desc,
      alternates: { canonical: `/counsellors/${params.slug}` },
      openGraph: { title, description: desc, type: 'profile' },
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
    worksFor: { '@type': 'Organization', name: 'GyanSanchaar' },
    ...(counsellor.photo_path ? { image: counsellor.photo_path } : {}),
    ...(counsellor.bio ? { description: counsellor.bio } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="text-xs text-muted mb-5">
          <Link href="/counsellors" className="hover:text-primary flex items-center gap-1 w-fit">
            <ArrowLeft className="w-3 h-3" /> All Counsellors
          </Link>
        </div>

        {/* Profile hero */}
        <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 text-white mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          {counsellor.photo_path ? (
            <Image
              src={counsellor.photo_path}
              alt={counsellor.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-lg flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
              {counsellor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{counsellor.name}</h1>
            {counsellor.specialisation && (
              <p className="text-white/70 text-sm mb-3">{counsellor.specialisation}</p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/70">
              {counsellor.rating && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <strong className="text-white">{counsellor.rating}</strong>
                  {counsellor.review_count > 0 && <span>({counsellor.review_count} reviews)</span>}
                </span>
              )}
              {counsellor.experience_years && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {counsellor.experience_years} years experience
                </span>
              )}
              {counsellor.languages?.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {counsellor.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            {counsellor.bio && (
              <section className="bg-white border border-border rounded-2xl p-6">
                <h2 className="font-bold text-heading mb-3">About</h2>
                <p className="text-body text-sm leading-relaxed">{counsellor.bio}</p>
              </section>
            )}

            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-4">Why book through GyanSanchaar?</h2>
              <ul className="space-y-3">
                {[
                  { icon: Shield, text: 'Background-verified credentials — qualifications confirmed before listing' },
                  { icon: CheckCircle, text: 'Zero commission model — counsellors are paid by us, not by colleges' },
                  { icon: Clock, text: '30-minute focused session — no upselling, no pressure' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-body">
                    <Icon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="bg-primary-light border border-border rounded-2xl p-6 sticky top-20">
              <div className="text-center mb-5">
                <div className="text-2xl font-extrabold text-primary">Free</div>
                <div className="text-xs text-muted">30-minute session</div>
              </div>
              <Link
                href={`/dashboard/bookings/new?counsellor=${params.slug}`}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Book Free Session
              </Link>
              <p className="text-xs text-muted text-center mt-3">
                You'll need a free account to book. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
