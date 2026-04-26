import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck, BadgeCheck, Heart, Eye, GraduationCap,
  ArrowRight, Award, Landmark, Users, Target,
  BookOpen, MapPin, Linkedin, Twitter,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { breadcrumbSchema, organizationSchema } from '@/lib/seo'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'
const API  = process.env.NEXT_PUBLIC_API_URL  ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Gyan Sanchaar | College Admission Platform for North-East India',
  description: 'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion — just trusted guidance.',
  keywords: ['college admission North-East India','MBBS admission Assam students','management quota admission India','Gyan Sanchaar about','Kumar Sanjay Krishna'],
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: 'About Gyan Sanchaar | College Admission Platform for North-East India',
    description: 'Gyan Sanchaar helps students from Assam and North-East India apply to verified colleges across India. No agents, no confusion — just trusted guidance.',
    url: `${BASE}/about`, siteName: 'Gyan Sanchaar',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'About Gyan Sanchaar' }],
  },
}

const VALUES = [
  { icon: Eye,         color: 'bg-blue-50 text-blue-700',      title: 'Transparency',  desc: 'No agents. No hidden commissions. Every fee disclosed upfront.' },
  { icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700',title: 'Trust',          desc: 'Only UGC-recognised, NAAC-accredited institutions are listed.' },
  { icon: Heart,       color: 'bg-rose-50 text-rose-700',      title: 'Accessibility', desc: 'Completely free for every student — always, without exception.' },
  { icon: Users,       color: 'bg-amber-50 text-amber-700',    title: 'Guidance',      desc: 'Students connect directly to the college\'s own counsellor.' },
]

const DIFF = [
  { icon: BookOpen,   title: 'Single Profile, Multiple Applications', desc: 'Build your profile once and apply to any number of verified colleges.' },
  { icon: BadgeCheck, title: 'Verified Colleges Only',                desc: 'Cross-checked against UGC, AICTE, MCI, and NIRF before listing.' },
  { icon: Users,      title: 'Direct Counsellor Access',              desc: 'The college\'s own admissions officer contacts you — no middlemen.' },
  { icon: MapPin,     title: 'Built for North-East Students',          desc: 'Every feature designed around the challenges students from this region face.' },
  { icon: Target,     title: 'DPDP Act 2023 Compliant',               desc: 'Your data stays yours. No profiling, no selling. Compliant with Indian law.' },
]

const MOCK_TEAM = [
  {
    id: 1, role_type: 'founder',
    name: 'Ankur Bora', title: 'Co-Founder & CEO',
    photo_url: null, linkedin_url: null, twitter_url: null,
    bio: "Ankur grew up in Jorhat, Assam, and watched talented classmates lose out on college admissions simply because they lacked the right information and guidance. That experience became the seed of GyanSanchaar. He leads the company's vision, strategy, and college partnerships — building a platform he wished had existed when he was a student.",
  },
  {
    id: 2, role_type: 'founder',
    name: 'Priyanka Hazarika', title: 'Co-Founder & COO',
    photo_url: null, linkedin_url: null, twitter_url: null,
    bio: "Priyanka spent five years working in student admissions at a leading university in Guwahati, where she witnessed firsthand how misinformation and agent-driven advice hurt students' futures. She co-founded GyanSanchaar to fix the process from the inside — building systems that are transparent, fair, and student-first.",
  },
  {
    id: 3, role_type: 'founder',
    name: 'Rohan Dey', title: 'Co-Founder & CTO',
    photo_url: null, linkedin_url: null, twitter_url: null,
    bio: "Rohan is a software engineer from Silchar who built his first education tool while still in college. At GyanSanchaar, he leads all technology and product development — designing the tools that help students search, compare, and apply to colleges without confusion or cost.",
  },
  {
    id: 4, role_type: 'mentor',
    name: 'Kumar Sanjay Krishna', title: 'Mentor & Strategic Advisor · Ex Chief Secretary, Assam (IAS Retd.)',
    photo_url: null, linkedin_url: null, twitter_url: null,
    bio: "A distinguished IAS officer and former Chief Secretary of Assam — one of the highest administrative positions in state governance. With decades of public service and deep understanding of institutional governance, his mentorship ensures GyanSanchaar operates with rigour, ethics, and a long-term vision that a student-facing platform demands. His guidance shapes our commitment to ethical practices, full transparency, and a student-first approach in everything we build.",
  },
]

async function getTeam() {
  try {
    const res = await fetch(`${API}/public/team`, { next: { revalidate: 300 } })
    if (!res.ok) return MOCK_TEAM
    const data = (await res.json()).data ?? []
    // If API returns placeholder names fall back to mock
    if (!data.length || data[0]?.name?.startsWith('Founder')) return MOCK_TEAM
    return data
  } catch { return MOCK_TEAM }
}

export default async function AboutPage() {
  const team      = await getTeam()
  const founders  = team.filter((m: any) => m.role_type === 'founder')
  const mentors   = team.filter((m: any) => m.role_type === 'mentor')

  const schemas = [
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]),
    organizationSchema(),
  ]

  return (
    <>
      <Header />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="bg-white text-heading">

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <div className="border-b border-border bg-white">
          <div className="max-w-container mx-auto px-6 py-3 text-xs text-muted flex items-center gap-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-heading font-medium">About Us</span>
          </div>
        </div>

        {/* ── 1. OUR STORY ─────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Our Story</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-heading mb-6 leading-tight">
                  A Platform Born from a Real Problem
                </h1>
                <div className="space-y-4 text-body leading-relaxed text-[15px]">
                  <p>Every year, thousands of students from Assam, Meghalaya, Manipur, Nagaland and other North-Eastern states prepare for college admissions — often with limited access to reliable information and without anyone trustworthy to guide them.</p>
                  <p>The existing system was broken. Consultants charged fees. Agents pushed colleges that paid commissions, not colleges that fit the student. Families made decisions based on hearsay. Students from smaller towns were especially disadvantaged.</p>
                  <p>Gyan Sanchaar was built to change that — a platform where every college is independently verified, every application is free, and every student gets access to the same quality of information regardless of where they come from.</p>
                  <p className="font-semibold text-heading">We are not an agent. We do not charge students. We exist to give students from North-East India the same fair shot at a great education that students everywhere else already have.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { emoji: '📍', title: 'The Problem', text: 'Students from North-East India lacked access to verified, unbiased college information and trustworthy admission guidance.', bg: 'bg-rose-50 border-rose-100' },
                  { emoji: '⚡', title: 'The Gap',     text: 'Too many agents, too much misinformation, and too little transparency — leaving families confused and students misguided.',   bg: 'bg-amber-50 border-amber-100' },
                  { emoji: '🎯', title: 'Our Answer',  text: 'A free, verified, student-first platform where information is transparent, applications are direct, and guidance comes with no hidden agenda.', bg: 'bg-emerald-50 border-emerald-100' },
                ].map(({ emoji, title, text, bg }) => (
                  <div key={title} className={`rounded-2xl border p-5 ${bg}`}>
                    <div className="text-xl mb-2">{emoji}</div>
                    <div className="font-semibold text-heading mb-1">{title}</div>
                    <p className="text-sm text-body">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MISSION & VALUES ──────────────────────────────────── */}
        <section className="py-16 bg-slate-50 border-y border-border">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Mission & Values</div>
              <h2 className="text-3xl font-extrabold text-heading mb-4">What We Stand For</h2>
              <p className="text-body text-base">
                <strong className="text-heading">Our Mission:</strong> Empower students from North-East India with verified opportunities, transparent guidance, and equal access to top colleges across India.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map(({ icon: Icon, color, title, desc }) => (
                <article key={title} className="bg-white rounded-2xl p-6 border border-border hover:border-primary hover:shadow-card-hover transition-all">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}><Icon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-heading mb-2">{title}</h3>
                  <p className="text-sm text-body leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. WHAT MAKES US DIFFERENT ───────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Why Gyan Sanchaar</div>
              <h2 className="text-3xl font-extrabold text-heading mb-3">What Makes Us Different</h2>
              <p className="text-body">We built a complete admission system — verified, free, and student-first.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {DIFF.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="group flex gap-4 p-6 rounded-2xl border border-border hover:border-primary hover:shadow-card-hover transition-all">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-heading mb-1 text-sm">{title}</h3>
                    <p className="text-xs text-body leading-relaxed">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. FOUNDERS ──────────────────────────────────────────── */}
        {founders.length > 0 && (
          <section className="py-16 bg-slate-50 border-y border-border">
            <div className="max-w-container mx-auto px-6">
              <div className="text-center mb-10">
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">The People Behind It</div>
                <h2 className="text-3xl font-extrabold text-heading">Our Founders</h2>
                <p className="text-body mt-3 max-w-xl mx-auto">Built by people who believe every student deserves equal access to quality education — regardless of where they're from.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {founders.map((m: any) => (
                  <article key={m.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className="h-44 bg-gradient-to-br from-primary-light to-indigo-50 flex items-center justify-center">
                      {m.photo_url
                        ? <Image src={m.photo_url} alt={m.name} width={120} height={120} className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg" />
                        : <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">{m.name.charAt(0).toUpperCase()}</div>
                      }
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-heading text-base">{m.name}</h3>
                      <p className="text-primary text-sm font-medium mt-0.5 mb-3">{m.title}</p>
                      <p className="text-body text-sm leading-relaxed line-clamp-4">{m.bio}</p>
                      {(m.linkedin_url || m.twitter_url) && (
                        <div className="flex gap-3 mt-4">
                          {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>}
                          {m.twitter_url  && <a href={m.twitter_url}  target="_blank" rel="noopener noreferrer" className="text-muted hover:text-sky-500 transition-colors"><Twitter className="w-4 h-4" /></a>}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. MENTOR ────────────────────────────────────────────── */}
        {mentors.map((m: any) => (
          <section key={m.id} className="py-16 bg-heading text-white">
            <div className="max-w-container mx-auto px-6">
              <div className="text-center mb-10">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Mentorship & Leadership</div>
                <h2 className="text-3xl font-extrabold">Guided by Experience, <span className="text-yellow-400">Strengthened by Leadership</span></h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-56 h-72 rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                      {m.photo_url
                        ? <Image src={m.photo_url} alt={m.name} width={224} height={288} className="w-full h-full object-cover" />
                        : <><Landmark className="w-14 h-14 text-blue-400 mb-4" /><div className="text-center px-4"><div className="font-bold text-white">{m.name}</div><div className="text-blue-300 text-xs mt-1">{m.title}</div></div></>
                      }
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Mentor & Advisor
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white">{m.name}</h3>
                    <p className="text-yellow-400 font-medium mt-1 text-sm">{m.title}</p>
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm">{m.bio}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ icon: ShieldCheck, text: 'Ethical Practices' }, { icon: Eye, text: 'Full Transparency' }, { icon: Heart, text: 'Student-First' }].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 text-xs text-white/80 border border-white/10">
                        <Icon className="w-3.5 h-3.5 text-yellow-400 shrink-0" />{text}
                      </div>
                    ))}
                  </div>
                  {(m.linkedin_url || m.twitter_url) && (
                    <div className="flex gap-3">
                      {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5" /></a>}
                      {m.twitter_url  && <a href={m.twitter_url}  target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-sky-400 transition-colors"><Twitter className="w-5 h-5" /></a>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── 6. TRUST STATS ───────────────────────────────────────── */}
        <section className="py-14 bg-white border-y border-border">
          <div className="max-w-container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { num: '100%', label: 'Verified Colleges' },
                { num: '₹0',  label: 'Application Fee for Students' },
                { num: '8',   label: 'States Covered in North-East' },
                { num: '0',   label: 'Hidden Commissions' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-3xl font-extrabold text-primary">{num}</div>
                  <div className="text-xs text-body mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. CTA ───────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-heading">
              Your Admission Journey Deserves Clarity, <span className="text-primary">Not Confusion</span>
            </h2>
            <p className="text-body">Join students from across North-East India who chose a smarter, fairer way to apply — with no agents and no hidden fees.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/colleges" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3 rounded-xl hover:bg-primary-dark transition shadow-sm">
                Apply Now — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/colleges" className="inline-flex items-center gap-2 border border-border text-heading font-medium px-7 py-3 rounded-xl hover:bg-white transition">
                Talk to Counsellor
              </Link>
            </div>
            <p className="text-muted text-xs">Always free. No registration fee. No hidden charges.</p>
          </div>
        </section>

        {/* ── Anti-ragging ─────────────────────────────────────────── */}
        <div className="bg-warning/10 border-y border-warning/20 py-3 px-4 text-center text-sm">
          <span className="font-semibold text-warning">Anti-Ragging Helpline: </span>
          <a href="tel:18001805522" className="font-bold text-[#92400E]">1800-180-5522</a>
          <span className="text-[#92400E]"> (Free · 24×7) · </span>
          <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline text-[#92400E]">antiragging.in</a>
        </div>

      </main>

      {/* ── FOOTER — same as homepage ─────────────────────────────── */}
      <footer className="bg-heading text-muted text-sm pt-14 pb-20 md:pb-14">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                <div className="w-7 h-7 rounded-lg bg-accent-gradient flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                GyanSanchaar
              </div>
              <p className="text-xs text-white/40 leading-relaxed max-w-xs mb-4">
                India's College Application Platform. Verified data. Direct admissions. DPDP Act 2023 compliant.
              </p>
              <div className="text-xs text-white/30">Made with ❤️ in India 🇮🇳</div>
            </div>
            {[
              { heading: 'Students', links: [['Colleges','/colleges'],['Courses','/courses'],['Exams','/exams'],['Apply','/register']] },
              { heading: 'Company',  links: [['About','/about'],['Articles','/articles'],['Contact','/contact'],['Grievance','/grievance']] },
              { heading: 'Legal',    links: [['Privacy Policy','/privacy'],['Terms','/terms'],['Grievance Policy','/grievance-policy'],['Refund','/refund']] },
            ].map(col => (
              <div key={col.heading}>
                <div className="text-white font-semibold text-xs uppercase tracking-wider mb-4">{col.heading}</div>
                <ul className="space-y-2.5">
                  {col.links.map(([l, h]) => (
                    <li key={h}><Link href={h} className="hover:text-white transition-colors text-xs">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-2 pt-6 text-xs text-white/30">
            <span>© {new Date().getFullYear()} GyanSanchaar. All rights reserved.</span>
            <span>Regulated under UGC Act · DPDP Act 2023</span>
          </div>
        </div>
      </footer>

      <MobileNav />
    </>
  )
}
