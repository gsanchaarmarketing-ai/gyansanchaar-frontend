import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck, BadgeCheck, Users, Zap, MapPin,
  BookOpen, Target, Heart, Eye, CheckCircle2,
  ArrowRight, Star, Award, Landmark, ChevronRight,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { breadcrumbSchema, organizationSchema } from '@/lib/seo'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

/* ── SEO ──────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Gyan Sanchaar | College Admission Platform for North-East India',
  description:
    'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion—just trusted guidance.',
  keywords: [
    'college admission North-East India',
    'MBBS admission Assam students',
    'management quota admission India',
    'college application Assam',
    'verified colleges Northeast India',
    'free college application India',
    'Gyan Sanchaar about',
    'Kumar Sanjay Krishna',
    'college guidance Assam',
  ],
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: 'Gyan Sanchaar | College Admission Platform for North-East India',
    description:
      'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion—just trusted guidance.',
    url: `${BASE}/about`,
    siteName: 'Gyan Sanchaar',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'About Gyan Sanchaar' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Gyan Sanchaar',
    description: 'College admission platform built for students from North-East India.',
    site: '@gyansanchaar',
  },
}

/* ── Static data ──────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: Eye,
    title: 'Transparency',
    desc: 'No agents. No hidden commissions. Every college listed is verified and every fee is disclosed upfront.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    desc: 'We list only UGC-recognised, NAAC-accredited institutions. If we cannot verify it, we do not list it.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Heart,
    title: 'Accessibility',
    desc: 'Applying to college should not cost money. Our platform is completely free for every student, always.',
    color: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Users,
    title: 'Guidance',
    desc: 'Every application connects students to the college\'s own admissions counsellor—not a third-party agent.',
    color: 'bg-amber-50 text-amber-700',
  },
]

const DIFFERENTIATORS = [
  {
    icon: BookOpen,
    title: 'Single Profile, Multiple Applications',
    desc: 'Build your academic profile once and apply to as many verified colleges as you want—all from one dashboard.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Colleges Only',
    desc: 'Every institution on Gyan Sanchaar is cross-checked against UGC, AICTE, MCI, and NIRF databases.',
  },
  {
    icon: Target,
    title: 'Seat Predictor Tool',
    desc: 'Based on your marks, rank, and category, our tool helps you shortlist colleges where you have a realistic chance.',
  },
  {
    icon: Users,
    title: 'Direct Counsellor Access',
    desc: 'Once you apply, the college\'s own admissions officer reaches out to you—no middlemen, no extra cost.',
  },
  {
    icon: MapPin,
    title: 'Built for North-East Students',
    desc: 'From Guwahati to Itanagar, we understand the unique challenges faced by students from this region and design every feature around them.',
  },
]

const TRUST_STATS = [
  { num: '100%', label: 'Verified Colleges' },
  { num: '₹0',   label: 'Application Fee for Students' },
  { num: '8',    label: 'States Served in North-East' },
  { num: '0',    label: 'Hidden Commissions' },
]

/* ── Page ─────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const schemas = [
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]),
    organizationSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Gyan Sanchaar',
      url: `${BASE}/about`,
      description:
        'Gyan Sanchaar is a student-first college admission platform built for students from Assam and North-East India.',
      mainEntity: {
        '@type': 'Organization',
        name: 'Gyan Sanchaar',
        founder: { '@type': 'Organization', name: 'Gyan Sanchaar Team' },
        location: { '@type': 'Place', name: 'Guwahati, Assam, India' },
      },
    },
  ]

  return (
    <>
      <Header />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main>

        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          </div>

          <div className="relative max-w-container mx-auto px-6 py-24 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Built in Guwahati. Serving all of North-East India.
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
              Guiding Dreams from{' '}
              <span className="text-yellow-300">North-East India</span>{' '}
              to India's Top Colleges
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-10">
              Gyan Sanchaar helps students from Assam and across North-East India discover,
              compare, and apply to verified colleges across India — with clarity, zero agent
              fees, and real human support.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/colleges"
                className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-semibold px-7 py-3 rounded-xl hover:bg-yellow-300 transition shadow-lg">
                Apply Now — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/colleges"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-7 py-3 rounded-xl hover:bg-white/10 transition">
                Talk to a Counsellor
              </Link>
            </div>

            {/* Quick trust pills */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {[
                '✅ UGC Verified Colleges Only',
                '✅ No Agent Fees',
                '✅ Free for All Students',
              ].map(t => (
                <span key={t} className="text-sm text-blue-200 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. OUR STORY ─────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Story content */}
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Our Story</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-heading mb-6 leading-tight">
                  A Platform Born from a Real Problem
                </h2>

                <div className="space-y-5 text-body leading-relaxed">
                  <p>
                    Every year, thousands of students from Assam, Meghalaya, Manipur, Nagaland, and
                    other North-Eastern states prepare for college admissions — often with limited access
                    to reliable information and without anyone trustworthy to guide them.
                  </p>
                  <p>
                    The existing system was broken. Consultants charged fees. Agents pushed colleges that
                    paid them commissions, not colleges that fit the student. Families made decisions based
                    on hearsay, brochures, or rushed counselling sessions. Students from smaller towns and
                    rural areas were especially disadvantaged.
                  </p>
                  <p>
                    Gyan Sanchaar was built to change that. We created a platform where every college
                    is independently verified, every application is free, and every student gets access
                    to the same quality of information — regardless of where they come from or what they
                    can afford.
                  </p>
                  <p>
                    We are not an agent. We do not charge students. We do not earn commissions from
                    colleges based on admissions. We exist for one reason: to give students from
                    North-East India the same fair shot at a great education that students in other
                    parts of India already have.
                  </p>
                </div>
              </div>

              {/* Right: Visual callout card */}
              <div className="space-y-4">
                {[
                  {
                    icon: '📍',
                    heading: 'The Problem',
                    text: 'Students from North-East India lacked access to verified, unbiased college information and trustworthy admission guidance.',
                    bg: 'bg-rose-50 border-rose-100',
                  },
                  {
                    icon: '⚡',
                    heading: 'The Gap',
                    text: 'Too many agents, too much misinformation, and too little transparency — leaving families confused and students misguided.',
                    bg: 'bg-amber-50 border-amber-100',
                  },
                  {
                    icon: '🎯',
                    heading: 'The Solution',
                    text: 'A free, verified, student-first platform where information is transparent, applications are direct, and guidance comes with no hidden agenda.',
                    bg: 'bg-emerald-50 border-emerald-100',
                  },
                ].map(({ icon, heading, text, bg }) => (
                  <div key={heading} className={`rounded-2xl border p-6 ${bg}`}>
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="font-semibold text-heading mb-1">{heading}</div>
                    <p className="text-sm text-body">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. MISSION & VALUES ──────────────────────────────────── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Mission & Values</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-heading mb-5">What We Stand For</h2>
              <p className="text-body leading-relaxed text-lg">
                <strong className="text-heading">Our Mission:</strong> Empower students from North-East India
                with verified opportunities, transparent guidance, and equal access to top colleges across India.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map(({ icon: Icon, title, desc, color }) => (
                <article key={title}
                  className="bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-shadow border border-border">
                  <div className={`inline-flex p-3 rounded-xl mb-5 ${color}`}>
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <h3 className="font-bold text-heading mb-2">{title}</h3>
                  <p className="text-sm text-body leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHAT MAKES US DIFFERENT ───────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Our Difference</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-heading mb-4">
                What Makes Gyan Sanchaar Different
              </h2>
              <p className="text-body leading-relaxed">
                We did not build another college listing website. We built a complete admission
                system — verified, free, and student-first.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIFFERENTIATORS.map(({ icon: Icon, title, desc }) => (
                <article key={title}
                  className="group flex gap-5 p-7 rounded-2xl border border-border hover:border-primary hover:shadow-card-hover transition-all">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold text-heading mb-1.5">{title}</h3>
                    <p className="text-sm text-body leading-relaxed">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. MENTOR SECTION ────────────────────────────────────── */}
        <section className="py-24 bg-gradient-to-br from-slate-900 to-[#1E3A8A] text-white">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Leadership & Mentorship</div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Guided by Experience,<br />
                <span className="text-yellow-300">Strengthened by Leadership</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              {/* Left: Photo placeholder */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-80 rounded-3xl bg-gradient-to-br from-blue-800 to-slate-700 flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                    <Landmark className="w-16 h-16 text-blue-300 mb-4" aria-hidden />
                    <div className="text-center px-6">
                      <div className="font-bold text-white text-lg leading-snug">Kumar Sanjay Krishna</div>
                      <div className="text-blue-300 text-sm mt-1">IAS (Retd.)</div>
                      <div className="text-blue-300 text-xs mt-0.5">Ex Chief Secretary, Assam</div>
                    </div>
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-900 rounded-xl px-4 py-2 text-xs font-bold shadow-lg">
                    <Award className="w-3.5 h-3.5 inline mr-1" />
                    Mentor & Advisor
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-6">
                <blockquote className="text-blue-100 text-lg italic leading-relaxed border-l-4 border-yellow-400 pl-5">
                  "Every student in North-East India deserves access to the same quality of guidance
                  and opportunity that is available anywhere else in the country. Gyan Sanchaar is a
                  step toward making that a reality."
                </blockquote>

                <div className="space-y-4 text-blue-100 text-sm leading-relaxed">
                  <p>
                    Gyan Sanchaar has the privilege of being guided by{' '}
                    <strong className="text-white">Shri Kumar Sanjay Krishna</strong>, a distinguished
                    IAS officer and former Chief Secretary of Assam — one of the highest administrative
                    positions in state governance.
                  </p>
                  <p>
                    With decades of public service, policy experience, and deep understanding of
                    institutional governance, his mentorship ensures that Gyan Sanchaar operates with
                    the rigour, ethics, and long-term vision that a student-facing platform demands.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { icon: ShieldCheck, text: 'Ethical Practices' },
                    { icon: Eye,         text: 'Full Transparency' },
                    { icon: Heart,       text: 'Student-First Approach' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text}
                      className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 text-sm text-blue-100 border border-white/10">
                      <Icon className="w-4 h-4 text-yellow-400 shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TRUST SECTION ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-container mx-auto px-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {TRUST_STATS.map(({ num, label }) => (
                <div key={label} className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-4xl font-extrabold text-primary">{num}</div>
                  <div className="text-sm text-body mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Trust statements */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-heading mb-4">
                Trusted by Students Across Assam and North-East India
              </h2>
              <p className="text-body">
                From the Brahmaputra plains to the hills of Meghalaya, students trust
                Gyan Sanchaar to guide them through one of life's most important decisions.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: BadgeCheck,
                  heading: '100% Verified Colleges',
                  body: 'Every institution on our platform is verified against official government databases before listing.',
                },
                {
                  icon: ShieldCheck,
                  heading: 'No Agents. No Commission Bias.',
                  body: 'We do not earn per admission. Our incentive is always aligned with the student, not the college.',
                },
                {
                  icon: Star,
                  heading: 'Guided by Experienced Leadership',
                  body: 'Administrative and governance expertise ensures we operate with the integrity students deserve.',
                },
              ].map(({ icon: Icon, heading, body }) => (
                <div key={heading}
                  className="text-center p-7 rounded-2xl border border-border hover:border-primary hover:shadow-card-hover transition-all">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-heading mb-2">{heading}</h3>
                  <p className="text-sm text-body leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-24 bg-gradient-to-r from-primary to-[#1E3A8A] text-white">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-widest">Start Today</div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Your Admission Journey Deserves Clarity,<br />
              <span className="text-yellow-300">Not Confusion</span>
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Join students from across North-East India who chose a smarter,
              fairer way to apply for college — with no agents and no hidden fees.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/colleges"
                className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-300 transition shadow-lg">
                Apply Now — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/colleges"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition">
                Predict Your Seat
              </Link>
              <Link href="/colleges"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition">
                Talk to Counsellor
              </Link>
            </div>
            <p className="text-blue-300 text-sm pt-2">
              Always free for students. No registration fee. No hidden charges.
            </p>
          </div>
        </section>

      </main>
      <MobileNav />
    </>
  )
}
