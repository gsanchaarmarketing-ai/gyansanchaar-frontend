import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Star, BookOpen, Search,
  GraduationCap, FileText, BarChart2, Shield, Compass,
  CalendarCheck, Users, Award, MapPin, ChevronRight,
  Zap, Clock, BadgeCheck
} from 'lucide-react'
import { publicApi } from '@/lib/api'
import MediaMarquee from '@/components/media/MediaMarquee'
import Footer from '@/components/layout/Footer'
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

/* ─── Design-system constants ─────────────────────────────────────── */

const STATS = [
  { num: '₹0',    label: 'Application Fees' },
  { num: '10min', label: 'To Apply' },
  { num: '100%',  label: 'Free for Students' },
  { num: '8',     label: 'States Covered' },
]

const FEATURES = [
  { icon: Search,       title: 'Smart Search',       desc: 'Filter by rank, fee, city, stream, NAAC grade and more in seconds.' },
  { icon: FileText,     title: 'One-Form Apply',      desc: 'A single application reaches multiple colleges simultaneously.' },
  { icon: BarChart2,    title: 'NIRF Rankings',       desc: 'Verified, bias-free data pulled directly from official NIRF reports.' },
  { icon: CalendarCheck,title: 'Exam Calendar',       desc: 'JEE, NEET, CAT, CUET and 50+ entrance dates in one place.' },
]

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: Compass,
    title: 'Discover',
    desc: 'Tell us your stream, marks and budget. We surface the best-fit colleges for your profile.',
  },
  {
    num: '02',
    icon: FileText,
    title: 'Apply',
    desc: 'One form. Multiple colleges. Your application goes straight to the admissions office.',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book Counselling',
    desc: 'Schedule a free session with a verified counsellor — no commissions, ever.',
  },
  {
    num: '04',
    icon: GraduationCap,
    title: 'Get Guided',
    desc: 'We stay with you through offer letters, document verification and enrolment.',
  },
]

const STREAMS = [
  'Engineering', 'Medical', 'Management', 'Law', 'Design',
  'Commerce', 'Arts', 'Science', 'Pharmacy', 'Architecture',
  'Hotel Management', 'Agriculture', 'Education', 'Nursing', 'Animation',
]

/* ─── Page ─────────────────────────────────────────────────────────── */

export default async function HomePage() {
  const token = await getToken().catch(() => null)
  const isLoggedIn = !!token
  const [articlesRes, collegesRes, mediaLogosRes] = await Promise.allSettled([
    publicApi.articles({ per_page: '4' }),
    publicApi.colleges({ per_page: '6', featured: 'true', sort: 'nirf' }),
    publicApi.mediaLogos(),
  ])

  const articles   = articlesRes.status   === 'fulfilled' ? articlesRes.value.data   : []
  const colleges   = collegesRes.status   === 'fulfilled' ? collegesRes.value.data   : []
  const mediaLogos = mediaLogosRes.status === 'fulfilled' ? mediaLogosRes.value.data : []

  const faqs = [
    { q: 'Is GyanSanchaar free for students?', a: 'Yes. GyanSanchaar is completely free for students. We charge colleges, not students.' },
    { q: 'Which states does GyanSanchaar cover?', a: 'We currently cover Assam, Meghalaya, Tripura, Nagaland, Manipur, Mizoram, Arunachal Pradesh, and Sikkim.' },
    { q: 'How does counselling work?', a: 'Each college has assigned admissions counsellors. Once you apply, their counsellor contacts you directly.' },
    { q: 'Can I apply to multiple colleges?', a: 'Yes. One profile, multiple colleges — all from your dashboard.' },
  ]

  return (
    <>
      <Header />
      {/* JSON-LD: HowTo + FAQ for AEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <main className="bg-white text-heading">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8]">
          {/* bg orbs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative max-w-container mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Heading + CTA */}
            <div className="select-none">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-5">
                Find the right college.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                  Apply directly.
                </span><br />
                Zero fees. Always.
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
                Discover verified colleges and courses across India.
                One application — apply to as many as you want.
                No consultants. No hidden charges. <strong className="text-white">Built for students who deserve better.</strong>
              </p>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href={isLoggedIn ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3.5 rounded-xl hover:bg-primary-light transition-all shadow-lg text-sm">
                  {isLoggedIn ? 'Go to Dashboard' : 'Start Free Application'} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/colleges"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm">
                  Browse Colleges
                </Link>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-3 text-xs text-white/60">
                {['No registration fees ever', 'DPDP Act compliant', 'UGC-recognised colleges only'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Mobile mockup card */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-64 bg-white rounded-[2rem] shadow-2xl shadow-black/40 border border-white/20 overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#0F172A] px-5 pt-4 pb-3">
                    <div className="text-[10px] text-white/40 mb-3">9:41 AM</div>
                    <div className="text-white font-bold text-sm mb-1">Hi, Arjun 👋</div>
                    <div className="text-white/60 text-xs">3 applications pending</div>
                  </div>
                  {/* Cards in phone */}
                  <div className="p-3 space-y-2 bg-slate-50">
                    {['AIIMS Delhi — MBBS', 'Delhi University — BA Economics', 'IIM Ahmedabad — MBA'].map((c, i) => (
                      <div key={c} className="bg-white rounded-xl p-3 border border-border shadow-card flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-success'}`}>
                          <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-heading leading-tight">{c}</div>
                          <div className="text-[10px] text-muted mt-0.5">{i === 0 ? 'Applied ✓' : i === 1 ? 'Under Review' : 'Shortlisted'}</div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-accent-gradient rounded-xl p-3 text-white text-center text-xs font-semibold mt-1">
                      Browse all colleges →
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -right-4 top-12 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-7 h-7 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-heading">Offer Received</div>
                    <div className="text-[9px] text-muted">BITS Pilani</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stream marquee strip */}
          <div className="relative border-t border-white/10 bg-white/5 overflow-hidden py-3">
            <div className="flex animate-marquee gap-4 whitespace-nowrap">
              {[...STREAMS, ...STREAMS].map((s, i) => (
                <span key={i} className="shrink-0 text-white/50 text-xs font-medium px-4 py-1 border border-white/10 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-white py-10">
          <div className="max-w-container mx-auto px-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-extrabold text-primary">{s.num}</div>
                  <div className="text-xs text-muted mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Media coverage marquee */}
            {mediaLogos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted font-medium px-3">As seen in</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <MediaMarquee logos={mediaLogos} />
              </div>
            )}
          </div>
        </section>

        {/* ── FEATURES GRID (4 cards) ───────────────────────────────── */}
        <section className="py-20 bg-primary-light">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Everything in one place</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-heading">Built for the Indian student</h2>
              <p className="text-body mt-3 max-w-xl mx-auto">No more juggling 10 college websites, spreadsheets and agent WhatsApp groups.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="bg-white rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                  <div className="w-11 h-11 bg-accent-gradient rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-heading mb-2">{title}</h3>
                  <p className="text-body text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (4 steps horizontal) ────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center mb-14">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Simple process</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-heading">How GyanSanchaar Works</h2>
              <p className="text-body mt-3">Four steps. One platform. Your admission — simplified.</p>
            </div>

            {/* Step cards — horizontal on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
              {/* connector line */}
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.num} className="relative z-10 flex flex-col items-center text-center px-4 pb-8 md:pb-0">
                  {/* Step number bubble */}
                  <div className="w-20 h-20 rounded-2xl bg-accent-gradient flex flex-col items-center justify-center mb-5 shadow-lg shadow-primary/20">
                    <step.icon className="w-7 h-7 text-white mb-0.5" />
                    <span className="text-[10px] text-white/70 font-bold">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-heading text-base mb-2">{step.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{step.desc}</p>

                  {/* Mobile connector */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="md:hidden w-px h-8 bg-border my-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/30">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FEATURED COLLEGES (scroll cards) ─────────────────────── */}
        {colleges.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="max-w-container mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Top picks</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-heading">Featured Colleges</h2>
                </div>
                <Link href="/colleges"
                  className="hidden md:flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                  Explore all colleges <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Scroll container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {colleges.map(c => (
                  <div key={c.id}
                    className="bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden group">
                    {/* Image area */}
                    <div className="h-36 bg-gradient-to-br from-primary-light to-blue-100 flex items-center justify-center relative">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-primary" />
                      </div>
                      {/* Badge/Verified */}
                      <div className="absolute top-3 right-3 bg-white border border-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </div>
                      {/* Tag/Quota */}
                      {c.naac_grade && (
                        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          NAAC {c.naac_grade}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Name */}
                      <h3 className="font-bold text-heading text-sm leading-snug mb-1 group-hover:text-primary transition-colors">
                        {c.name}
                      </h3>
                      {/* Location */}
                      <div className="flex items-center gap-1 text-muted text-xs mb-3">
                        <MapPin className="w-3 h-3" />
                        {c.city}{c.state ? `, ${c.state.name}` : ''}
                      </div>

                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {c.nirf_rank && (
                          <span className="bg-primary-light text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            NIRF #{c.nirf_rank}
                          </span>
                        )}
                        {c.type && (
                          <span className="bg-slate-100 text-body text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {c.type}
                          </span>
                        )}
                      </div>

                      {/* CTA row */}
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Link href={`/colleges/${c.slug}`}
                          className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 rounded-lg text-center transition-colors">
                          Apply Now
                        </Link>
                        <Link href={`/colleges/${c.slug}`}
                          className="flex-1 border border-border hover:border-primary text-body hover:text-primary text-xs font-medium py-2 rounded-lg text-center transition-all">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 md:hidden">
                <Link href="/colleges" className="text-primary text-sm font-semibold flex items-center justify-center gap-1">
                  View all colleges <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── SOCIAL PROOF / MISSION ───────────────────────────────── */}
        <section className="py-20 bg-accent-gradient text-white">
          <div className="max-w-container mx-auto px-6 text-center">
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Our mission</div>
            <p className="text-2xl md:text-4xl font-extrabold leading-tight max-w-3xl mx-auto">
              Bringing <span className="text-blue-200">Order</span>, <span className="text-indigo-200">Access</span> &amp;{' '}
              <span className="text-sky-200">Verified Clarity</span> to India's most important decision.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/70">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-white/50" /> DPDP Act 2023 Compliant</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-white/50" /> UGC & NAAC Verified</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-white/50" /> No Agent Commissions</span>
            </div>
          </div>
        </section>

        {/* ── ARTICLES ─────────────────────────────────────────────── */}
        {articles.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-container mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Stay informed</div>
                  <h2 className="text-3xl font-extrabold text-heading">News &amp; Articles</h2>
                </div>
                <Link href="/articles" className="hidden md:flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {articles.map(a => (
                  <Link key={a.id} href={`/articles/${a.slug}`}
                    className="group bg-white border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                    <div className="h-32 bg-gradient-to-br from-primary-light to-indigo-50 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary/40" />
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">{a.category}</div>
                      <h3 className="text-sm font-semibold text-heading leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="text-xs text-muted mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ANTI-RAGGING ─────────────────────────────────────────── */}
        <div className="bg-warning/10 border-y border-warning/20 py-3 px-4 text-center text-sm">
          <span className="font-semibold text-warning">Anti-Ragging Helpline: </span>
          <a href="tel:18001805522" className="font-bold text-[#92400E]">1800-180-5522</a>
          <span className="text-[#92400E]"> (Free · 24×7) · </span>
          <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline text-[#92400E]">antiragging.in</a>
        </div>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <Footer />

      <MobileNav />
    </>
  )
}
