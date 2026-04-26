import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, CheckCircle, Star, BookOpen, Search,
  GraduationCap, FileText, BarChart2, Shield, Compass,
  CalendarCheck, Users, Award, MapPin, ChevronRight,
  Zap, Clock, BadgeCheck
} from 'lucide-react'
import { publicApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { getCmsContent, c } from '@/lib/cms'
import { breadcrumbSchema, howItWorksSchema, faqSchema } from '@/lib/seo'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCmsContent('homepage').catch(() => ({} as Record<string, string>))
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'
  const title = c(content, 'home.seo_title', 'GyanSanchaar — Find Your College. Apply Free. No Agent Fees.')
  const desc  = c(content, 'home.seo_description', 'Discover colleges and courses across India. Apply directly — no consultants, no hidden fees.')
  return {
    title,
    description: desc,
    alternates: { canonical: BASE },
    openGraph: { title, description: desc, url: BASE },
  }
}

export const dynamic = 'force-dynamic'

const FEATURES = [
  { icon: Search,       title: 'Smart Search',       desc: 'Filter by rank, fee, city, stream, NAAC grade and more in seconds.' },
  { icon: FileText,     title: 'One-Form Apply',      desc: 'A single application reaches multiple colleges simultaneously.' },
  { icon: BarChart2,    title: 'NIRF Rankings',       desc: 'Verified, bias-free data pulled directly from official NIRF reports.' },
  { icon: CalendarCheck,title: 'Exam Calendar',       desc: 'JEE, NEET, CAT, CUET and 50+ entrance dates in one place.' },
]

const HOW_IT_WORKS = [
  { num: '01', icon: Compass,       title: 'Discover',        desc: 'Tell us your stream, marks and budget. We surface the best-fit colleges for your profile.' },
  { num: '02', icon: FileText,      title: 'Apply',           desc: 'One form. Multiple colleges. Your application goes straight to the admissions office.' },
  { num: '03', icon: CalendarCheck, title: 'Book Counselling',desc: "Get connected with the college's assigned counsellor — no commissions, ever." },
  { num: '04', icon: GraduationCap, title: 'Get Guided',      desc: 'We stay with you through offer letters, document verification and enrolment.' },
]

const STREAMS = [
  'Engineering','Medical','Management','Law','Design',
  'Commerce','Arts','Science','Pharmacy','Architecture',
  'Hotel Management','Agriculture','Education','Nursing','Animation',
]

export default async function HomePage() {
  const token = await getToken().catch(() => null)
  const isLoggedIn = !!token

  const [articlesRes, collegesRes, content] = await Promise.all([
    publicApi.articles({ per_page: '4' }).catch(() => ({ data: [] })),
    publicApi.colleges({ per_page: '6', sort: 'nirf' }).catch(() => ({ data: [] })),
    getCmsContent('homepage').catch(() => ({} as Record<string, string>)),
  ])

  const articles = (articlesRes as any).data ?? []
  const colleges = (collegesRes as any).data ?? []

  const stats = [
    { num: c(content, 'home.stats_1_num', '₹0'),    label: c(content, 'home.stats_1_label', 'Application Fees') },
    { num: c(content, 'home.stats_2_num', '10 min'), label: c(content, 'home.stats_2_label', 'To Apply') },
    { num: c(content, 'home.stats_3_num', '100%'),   label: c(content, 'home.stats_3_label', 'Free for Students') },
    { num: c(content, 'home.stats_4_num', '8'),      label: c(content, 'home.stats_4_label', 'States Covered') },
  ]

  const faqs = [
    { q: c(content, 'home.faq_1_q', 'Is GyanSanchaar free?'),            a: c(content, 'home.faq_1_a', 'Yes, completely free for students.') },
    { q: c(content, 'home.faq_2_q', 'Which states are covered?'),        a: c(content, 'home.faq_2_a', 'Northeast India and beyond.') },
    { q: c(content, 'home.faq_3_q', 'How does counselling work?'),       a: c(content, 'home.faq_3_a', 'College counsellors contact you after you apply.') },
    { q: c(content, 'home.faq_4_q', 'Can I apply to multiple colleges?'),a: c(content, 'home.faq_4_a', 'Yes, from your dashboard.') },
  ]

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

  return (
    <>
      <Header />

      {/* JSON-LD: HowTo + FAQ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: 'Home', url: '/' }])) }} />

      <main className="bg-white text-heading">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative max-w-container mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                {c(content, 'home.hero_title', 'Find Your College. Apply Free.')}
              </h1>
              <p className="text-lg text-blue-200 leading-relaxed max-w-lg">
                {c(content, 'home.hero_subtitle', 'No agents. No hidden fees. Just the best colleges in India — straight to your screen.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/colleges"
                  className="inline-flex items-center gap-2 bg-accent text-heading font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition">
                  {c(content, 'home.hero_cta_primary', 'Explore Colleges')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how-it-works"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition">
                  {c(content, 'home.hero_cta_secondary', 'How It Works')}
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {[
                  { icon: Shield,    text: 'UGC Verified Only' },
                  { icon: BadgeCheck,text: 'NAAC Accredited' },
                  { icon: Zap,       text: 'Apply in 10 min' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-blue-200 text-sm">
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Stats card */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-accent">{s.num}</div>
                  <div className="text-sm text-blue-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map(({ num, icon: Icon, title, desc }) => (
                <article key={num} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <div className="text-xs font-bold text-primary/40 mb-3">{num}</div>
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED COLLEGES ─────────────────────────────────────── */}
        {colleges.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-container mx-auto px-6">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold">Top Colleges</h2>
                <Link href="/colleges" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((col: any) => (
                  <Link key={col.id} href={`/colleges/${col.slug}`}
                    className="group block border rounded-2xl overflow-hidden hover:shadow-lg transition">
                    {col.logo_path && (
                      <div className="h-36 bg-slate-50 flex items-center justify-center p-4">
                        <Image
                          src={col.logo_path}
                          alt={`${col.name} logo`}
                          width={160} height={80}
                          className="object-contain max-h-full"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold group-hover:text-primary transition">{col.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" aria-hidden /> {col.city}
                        {col.state?.name && `, ${col.state.name}`}
                      </p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {col.nirf_rank  && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">NIRF #{col.nirf_rank}</span>}
                        {col.naac_grade && <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">NAAC {col.naac_grade}</span>}
                        {col.ugc_verified && <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded">UGC ✓</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <Icon className="w-7 h-7 text-primary mb-4" aria-hidden />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── STREAMS ─────────────────────────────────────────────── */}
        <section className="py-14 bg-white">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-8">Explore by Stream</h2>
            <nav aria-label="Course streams" className="flex flex-wrap justify-center gap-3">
              {STREAMS.map(stream => (
                <Link key={stream}
                  href={`/colleges?stream=${encodeURIComponent(stream)}`}
                  className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition">
                  {stream}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* ── FAQ (AEO) ────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <dl className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="bg-white rounded-2xl p-6 shadow-sm">
                  <dt className="font-semibold text-slate-800 mb-2">{q}</dt>
                  <dd className="text-slate-500 text-sm leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── ARTICLES ─────────────────────────────────────────────── */}
        {articles.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-container mx-auto px-6">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold">Latest Articles</h2>
                <Link href="/articles" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`}
                    className="group block border rounded-2xl overflow-hidden hover:shadow-lg transition">
                    {a.cover_image && (
                      <div className="h-40 overflow-hidden">
                        <Image src={a.cover_image} alt={a.title} width={400} height={160}
                          className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition line-clamp-2">{a.title}</h3>
                      {a.excerpt && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white text-center">
          <div className="max-w-2xl mx-auto px-6 space-y-6">
            <h2 className="text-3xl font-bold">Ready to find your college?</h2>
            <p className="text-blue-100">Join thousands of students who applied for free with GyanSanchaar.</p>
            <Link href={isLoggedIn ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 bg-accent text-heading font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition">
              {isLoggedIn ? 'Go to Dashboard' : 'Start Your Application'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <MobileNav />
    </>
  )
}
