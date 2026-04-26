import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck, BadgeCheck, Heart, Eye,
  ArrowRight, Award, Linkedin, Twitter,
  CheckCircle2, MapPin, Users, Target,
  BookOpen, Landmark,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { breadcrumbSchema, organizationSchema } from '@/lib/seo'

const BASE  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'
const API   = process.env.NEXT_PUBLIC_API_URL  ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Gyan Sanchaar | College Admission Platform for North-East India',
  description: 'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion — just trusted guidance.',
  keywords: ['college admission North-East India','MBBS admission Assam students','management quota admission India','free college application Assam','Gyan Sanchaar about','Kumar Sanjay Krishna'],
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: 'About Gyan Sanchaar | College Admission Platform for North-East India',
    description: 'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion — just trusted guidance.',
    url: `${BASE}/about`, siteName: 'Gyan Sanchaar',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'About Gyan Sanchaar' }],
  },
}

const VALUES = [
  { icon: Eye,        color: 'bg-blue-100 text-blue-700',    title: 'Transparency',   desc: 'No agents. No hidden commissions. Every fee is disclosed upfront.' },
  { icon: ShieldCheck,color: 'bg-emerald-100 text-emerald-700', title: 'Trust',       desc: 'We list only UGC-recognised, NAAC-accredited institutions.' },
  { icon: Heart,      color: 'bg-rose-100 text-rose-700',    title: 'Accessibility',  desc: 'Completely free for every student — always, without exception.' },
  { icon: Users,      color: 'bg-amber-100 text-amber-700',  title: 'Guidance',       desc: 'Every application connects students to the college\'s own counsellor.' },
]

const DIFFERENTIATORS = [
  { icon: BookOpen, title: 'Single Profile, Multiple Applications', desc: 'Build your profile once and apply to as many verified colleges as you want.' },
  { icon: BadgeCheck, title: 'Verified Colleges Only', desc: 'Cross-checked against UGC, AICTE, MCI, and NIRF databases before listing.' },
  { icon: Target, title: 'Seat Predictor Tool', desc: 'Shortlist colleges where you have a realistic chance based on your marks and rank.' },
  { icon: Users, title: 'Direct Counsellor Access', desc: 'The college\'s own admissions officer reaches out — no middlemen, no extra cost.' },
  { icon: MapPin, title: 'Built for North-East Students', desc: 'Every feature designed around the unique challenges students from this region face.' },
]

async function getTeamMembers() {
  try {
    const res = await fetch(`${API}/public/team`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

export default async function AboutPage() {
  const team = await getTeamMembers()
  const founders = team.filter((m: any) => m.role_type === 'founder')
  const mentors  = team.filter((m: any) => m.role_type === 'mentor')

  const schemas = [
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]),
    organizationSchema(),
    { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Gyan Sanchaar', url: `${BASE}/about` },
  ]

  return (
    <>
      <Header />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="bg-white">

        {/* ── 1. HERO — white, not dark blue ─────────────────────── */}
        <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-20">
          <div className="max-w-container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Built in Guwahati · Serving all of North-East India
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5 max-w-3xl mx-auto">
              Guiding Dreams from{' '}
              <span className="text-blue-600">North-East India</span>{' '}
              to India's Top Colleges
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Gyan Sanchaar helps students from Assam and across North-East India discover,
              compare, and apply to verified colleges — with zero agent fees and real human support.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/colleges"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
                Apply Now — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/colleges"
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-medium px-7 py-3 rounded-xl hover:bg-slate-100 transition">
                Talk to a Counsellor
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              {['✅ UGC Verified Colleges Only','✅ No Agent Fees','✅ Always Free for Students'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. OUR STORY ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Our Story</div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">A Platform Born from a Real Problem</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
                  <p>Every year, thousands of students from Assam, Meghalaya, Manipur, Nagaland and other North-Eastern states prepare for college admissions — often with limited access to reliable information and without anyone trustworthy to guide them.</p>
                  <p>The existing system was broken. Consultants charged fees. Agents pushed colleges that paid commissions, not colleges that fit the student. Families made decisions based on hearsay. Students from smaller towns were especially disadvantaged.</p>
                  <p>Gyan Sanchaar was built to change that — a platform where every college is independently verified, every application is free, and every student gets access to the same quality of information regardless of where they come from.</p>
                  <p className="font-medium text-slate-800">We are not an agent. We do not charge students. We exist for one reason: to give students from North-East India the same fair shot at a great education.</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { emoji: '📍', title: 'The Problem', text: 'Students from North-East India lacked access to verified, unbiased college information and trustworthy admission guidance.', border: 'border-rose-200 bg-rose-50' },
                  { emoji: '⚡', title: 'The Gap',     text: 'Too many agents, too much misinformation, and too little transparency — leaving families confused and students misguided.', border: 'border-amber-200 bg-amber-50' },
                  { emoji: '🎯', title: 'Our Answer',  text: 'A free, verified, student-first platform where information is transparent, applications are direct, and guidance comes with no hidden agenda.', border: 'border-emerald-200 bg-emerald-50' },
                ].map(({ emoji, title, text, border }) => (
                  <div key={title} className={`rounded-2xl border p-5 ${border}`}>
                    <div className="text-xl mb-2">{emoji}</div>
                    <div className="font-semibold text-slate-800 mb-1">{title}</div>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. MISSION & VALUES ──────────────────────────────────── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Mission & Values</div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">What We Stand For</h2>
              <p className="text-slate-600 text-lg"><strong>Our Mission:</strong> Empower students from North-East India with verified opportunities, transparent guidance, and equal access to top colleges across India.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map(({ icon: Icon, color, title, desc }) => (
                <article key={title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}><Icon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. WHAT MAKES US DIFFERENT ───────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Why Gyan Sanchaar</div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">What Makes Us Different</h2>
              <p className="text-slate-500">We built a complete admission system — verified, free, and student-first.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {DIFFERENTIATORS.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="group flex gap-4 p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. FOUNDERS ──────────────────────────────────────────── */}
        {founders.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="max-w-container mx-auto px-6">
              <div className="text-center mb-12">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">The People Behind It</div>
                <h2 className="text-3xl font-extrabold text-slate-900">Our Founders</h2>
                <p className="text-slate-500 mt-3 max-w-xl mx-auto">Built by people who believe every student deserves equal access to quality education — regardless of where they're from.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {founders.map((m: any) => (
                  <article key={m.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-52 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={m.name} width={160} height={160} className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 text-lg">{m.name}</h3>
                      <p className="text-blue-600 text-sm font-medium mt-0.5 mb-3">{m.title}</p>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">{m.bio}</p>
                      {(m.linkedin_url || m.twitter_url) && (
                        <div className="flex gap-3 mt-4">
                          {m.linkedin_url && (
                            <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer"
                               className="text-slate-400 hover:text-blue-600 transition-colors">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {m.twitter_url && (
                            <a href={m.twitter_url} target="_blank" rel="noopener noreferrer"
                               className="text-slate-400 hover:text-sky-500 transition-colors">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. MENTOR ────────────────────────────────────────────── */}
        {mentors.map((m: any) => (
          <section key={m.id} className="py-20 bg-slate-900 text-white">
            <div className="max-w-container mx-auto px-6">
              <div className="text-center mb-12">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Leadership & Mentorship</div>
                <h2 className="text-3xl font-extrabold">Guided by Experience,{' '}
                  <span className="text-yellow-400">Strengthened by Leadership</span>
                </h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-80 rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={m.name} width={256} height={320} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Landmark className="w-16 h-16 text-blue-400 mb-4" />
                          <div className="text-center px-6">
                            <div className="font-bold text-white text-lg leading-snug">{m.name}</div>
                            <div className="text-blue-400 text-sm mt-1">{m.title}</div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-900 rounded-xl px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Mentor & Advisor
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{m.name}</h3>
                    <p className="text-yellow-400 font-medium mt-1">{m.title}</p>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[15px]">{m.bio}</p>
                  <div className="grid sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { icon: ShieldCheck, text: 'Ethical Practices' },
                      { icon: Eye,         text: 'Full Transparency' },
                      { icon: Heart,       text: 'Student-First' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 border border-white/10">
                        <Icon className="w-4 h-4 text-yellow-400 shrink-0" />{text}
                      </div>
                    ))}
                  </div>
                  {(m.linkedin_url || m.twitter_url) && (
                    <div className="flex gap-3 pt-1">
                      {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5" /></a>}
                      {m.twitter_url  && <a href={m.twitter_url}  target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors"><Twitter className="w-5 h-5" /></a>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── 7. TRUST STATS ───────────────────────────────────────── */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { num: '100%', label: 'Verified Colleges' },
                { num: '₹0',  label: 'Application Fee for Students' },
                { num: '8',   label: 'States Covered in North-East' },
                { num: '0',   label: 'Hidden Commissions' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="text-4xl font-extrabold text-blue-600">{num}</div>
                  <div className="text-sm text-slate-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-6 space-y-5">
            <h2 className="text-3xl font-extrabold">
              Your Admission Journey Deserves Clarity,{' '}
              <span className="text-yellow-300">Not Confusion</span>
            </h2>
            <p className="text-blue-100">Join students from across North-East India who chose a smarter, fairer way to apply — with no agents and no hidden fees.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/colleges" className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-yellow-300 transition shadow-md">
                Apply Now — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/colleges" className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white font-medium px-8 py-3 rounded-xl hover:bg-white/25 transition">
                Talk to Counsellor
              </Link>
            </div>
            <p className="text-blue-200 text-sm">Always free. No registration fee. No hidden charges.</p>
          </div>
        </section>

      </main>
      <MobileNav />
    </>
  )
}
