import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, BookOpen, Search, GraduationCap, FileText, BarChart2, Shield } from 'lucide-react'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ArticleCard from '@/components/cards/ArticleCard'

export const metadata: Metadata = {
  title: 'GyanSanchaar — India\'s College Application Platform',
  description:
    'Apply to 500+ colleges across India in under 10 minutes. One form, verified data, zero agent fees.',
}

export const revalidate = 300

const STREAMS = [
  'Engineering', 'Medical', 'Management', 'Law', 'Design',
  'Commerce', 'Arts', 'Science', 'Pharmacy', 'Architecture',
  'Hotel Management', 'Agriculture', 'Education', 'Nursing',
]

const FEATURES = [
  { icon: Search, label: 'Smart College Search', desc: 'Filter by rank, fee, city, stream and more' },
  { icon: BookOpen, label: 'Explore Courses', desc: '10,000+ UG & PG programmes with detailed info' },
  { icon: FileText, label: 'One-Form Apply', desc: 'Apply to multiple colleges with a single form' },
  { icon: BarChart2, label: 'NIRF Rankings', desc: 'Verified, bias-free data from official sources' },
  { icon: GraduationCap, label: 'Track Applications', desc: 'Real-time status updates from colleges' },
  { icon: CheckCircle, label: 'Verified Colleges', desc: 'Every college is NAAC/UGC verified before listing' },
  { icon: Star, label: 'Exam Calendar', desc: 'JEE, NEET, CAT, CUET and 50+ entrance exams' },
  { icon: Shield, label: 'DPDP Compliant', desc: 'Your data is safe under India\'s data protection law' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Build Your Profile', desc: 'Enter your marks, stream preference and budget. Takes 3 minutes.' },
  { step: '02', title: 'Get Matched', desc: 'Our algorithm surfaces the best-fit colleges for your profile.' },
  { step: '03', title: 'Apply Directly', desc: 'One form. Multiple colleges. Application goes straight to admissions.' },
]

const STUDENT_PATHS = [
  {
    tag: 'Class 9 / 10 / 11',
    title: 'Figuring out what to study?',
    cta: 'Explore Courses',
    href: '/courses',
    bg: 'from-violet-900 to-indigo-900',
  },
  {
    tag: 'Class 12 — Ready to Apply',
    title: 'Apply to 500+ colleges in one go.',
    cta: 'Browse Colleges',
    href: '/colleges',
    bg: 'from-blue-900 to-cyan-900',
  },
  {
    tag: 'Undergrad → Postgrad',
    title: 'Looking at PG programmes?',
    cta: 'Explore PG Courses',
    href: '/courses?level=pg',
    bg: 'from-slate-900 to-slate-700',
  },
]

export default async function HomePage() {
  const [articlesRes, collegesRes] = await Promise.allSettled([
    publicApi.articles({ per_page: '4' }),
    publicApi.colleges({ per_page: '4', sort: 'nirf' }),
  ])

  const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : []
  const colleges = collegesRes.status === 'fulfilled' ? collegesRes.value.data : []

  return (
    <>
      <Header />
      <main className="pb-20 md:pb-0 bg-white">

        {/* ── Hero ── */}
        <section className="relative bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1e40af33_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#7c3aed22_0%,_transparent_60%)]" />
          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
            <div className="inline-block bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              2026 Admissions Open Now
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
              India's Smartest Way to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Find &amp; Apply to College
              </span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Apply to <strong className="text-white">500+ colleges</strong> across India in under 10 minutes.
              Verified data. Zero agent fees. Direct to admissions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-900/40 w-full sm:w-auto">
                Start Your Application →
              </Link>
              <Link href="/colleges"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl font-medium text-base transition-all w-full sm:w-auto">
                Browse Colleges
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No registration fees</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> DPDP compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> UGC verified colleges</span>
            </div>
          </div>

          {/* Scrolling stream strip */}
          <div className="relative border-t border-slate-800 overflow-hidden py-4">
            <div className="flex animate-marquee gap-6 whitespace-nowrap">
              {[...STREAMS, ...STREAMS].map((s, i) => (
                <span key={i} className="text-slate-400 text-sm font-medium px-4 py-1 border border-slate-700 rounded-full shrink-0">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Where are you right now ── */}
        <section className="bg-slate-50 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">Choose Where You Are Right Now</h2>
            <p className="text-center text-slate-500 mb-10">GyanSanchaar guides every stage of your education journey.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {STUDENT_PATHS.map((p) => (
                <Link key={p.href} href={p.href}
                  className={`relative bg-gradient-to-br ${p.bg} rounded-2xl p-7 text-white overflow-hidden group hover:scale-[1.02] transition-transform`}>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="inline-block bg-white/15 text-xs font-semibold px-3 py-1 rounded-full mb-4">{p.tag}</span>
                  <h3 className="text-xl font-bold mb-6 leading-snug">{p.title}</h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">How GyanSanchaar Works</h2>
            <p className="text-center text-slate-500 mb-12">Three steps. One platform. A lifetime decision — simplified.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((h) => (
                <div key={h.step} className="text-center">
                  <div className="text-5xl font-black text-blue-100 mb-3">{h.step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{h.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="bg-slate-950 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-bold leading-snug">
              GyanSanchaar exists to bring <span className="text-blue-400">Order</span>,{' '}
              <span className="text-violet-400">Access</span> and{' '}
              <span className="text-cyan-400">Verified Clarity</span> to the most important decision of a student's life.
            </p>
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Trusted by students</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-400" /> DPDP Act 2023 compliant</div>
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">Everything in One Place</h2>
            <p className="text-center text-slate-500 mb-10">Built for students. Designed with transparency.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">{label}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Top colleges strip ── */}
        {colleges.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Applications Closing Soon</h2>
                  <p className="text-slate-500 text-sm mt-1">Don't miss these deadlines</p>
                </div>
                <Link href="/colleges" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  See all 500+ colleges <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {colleges.map((c) => (
                  <Link key={c.id} href={`/colleges/${c.slug}`}
                    className="border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug mb-1">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.city}{c.state ? `, ${c.state.name}` : ''}</div>
                    {c.nirf_rank && (
                      <div className="mt-3 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                        NIRF #{c.nirf_rank}
                      </div>
                    )}
                    <div className="mt-3 text-xs font-semibold text-blue-600 flex items-center gap-1">
                      Apply Now <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Does applying through GyanSanchaar actually reach the college?</h2>
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-slate-600 leading-relaxed space-y-4">
              <p>
                <strong className="text-slate-900">Yes.</strong> When you apply, your application is sent directly to the college's admissions team.
                You receive acknowledgement within <strong className="text-slate-900">48 hours</strong> — from both GyanSanchaar and the college.
              </p>
              <p>
                It works exactly like applying on the college's own website, except you're doing it for multiple colleges from one place,
                <strong className="text-slate-900"> without paying separate fees to each</strong>.
              </p>
              <p className="text-blue-700 font-medium">
                No referral fees. No agent commissions. No one steering you toward a college they were paid to recommend.
              </p>
            </div>
          </div>
        </section>

        {/* ── News & Articles ── */}
        {articles.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">News &amp; Articles</h2>
                <Link href="/articles" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Stats ── */}
        <section className="bg-blue-600 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              { num: '500+', label: 'Verified Colleges' },
              { num: '10,000+', label: 'Courses Listed' },
              { num: '0', label: 'Agent Commissions' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-4xl font-black mb-1">{num}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Anti-ragging ── */}
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm">
            <span className="font-semibold text-amber-800">Anti-Ragging Helpline: </span>
            <a href="tel:18001805522" className="text-amber-700 font-bold">1800-180-5522</a>
            <span className="text-amber-700"> (Free, 24×7) · </span>
            <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">antiragging.in</a>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 text-sm py-14 md:pb-14 pb-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <GraduationCap className="w-6 h-6 text-blue-500" /> GyanSanchaar
            </div>
            <div className="text-xs leading-relaxed text-slate-500 max-w-xs">
              The College Applications Platform for India. Verified data. Direct admissions. DPDP Act 2023 compliant.
            </div>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Quick Links</div>
            <ul className="space-y-2">
              {[['Students', '/register'], ['Colleges', '/colleges'], ['Courses', '/courses'], ['Exams', '/exams']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Company</div>
            <ul className="space-y-2">
              {[['About', '/about'], ['Articles', '/articles'], ['Contact', '/contact'], ['Grievance', '/grievance']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Legal</div>
            <ul className="space-y-2">
              {[['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Grievance Policy', '/grievance-policy'], ['Refund Policy', '/refund']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-600 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} GyanSanchaar. All rights reserved. {process.env.NEXT_PUBLIC_COMPANY_CIN ? `CIN: ${process.env.NEXT_PUBLIC_COMPANY_CIN}` : ''}</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </footer>

      <MobileNav />
    </>
  )
}
