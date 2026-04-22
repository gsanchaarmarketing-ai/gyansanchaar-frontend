import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight, MapPin, Award, BookOpen } from 'lucide-react'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CollegeCard from '@/components/cards/CollegeCard'
import ArticleCard from '@/components/cards/ArticleCard'
import SearchBar from '@/components/forms/SearchBar'

export const metadata: Metadata = {
  title: 'GyanSanchaar — Find Your College in India',
  description:
    'Search thousands of colleges in India. Compare courses, fees, rankings. Apply with one form to multiple colleges.',
}

export const revalidate = 300 // 5 min ISR

export default async function HomePage() {
  const [collegesRes, articlesRes, streams] = await Promise.allSettled([
    publicApi.colleges({ per_page: '6', sort: 'nirf' }),
    publicApi.articles({ per_page: '4' }),
    publicApi.streams(),
  ])

  const colleges = collegesRes.status === 'fulfilled' ? collegesRes.value.data : []
  const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : []
  const streamsList = streams.status === 'fulfilled' ? streams.value.data : []

  return (
    <>
      <Header />
      <main className="pb-20 md:pb-0">

        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Find Your Dream College in India
            </h1>
            <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
              Search from thousands of colleges. Compare courses, fees, and rankings. Apply with one form.
            </p>
            <SearchBar />
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-brand-200">
              <span>🎓 Engineering</span>
              <span>🏥 Medical</span>
              <span>📊 Management</span>
              <span>⚖️ Law</span>
              <span>🎨 Design</span>
            </div>
          </div>
        </section>

        {/* Key actions */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/dashboard/application', icon: '📝', label: 'One-Form Application', desc: 'Apply to multiple colleges' },
              { href: '/dashboard/applications', icon: '📋', label: 'Track Applications', desc: 'Check status anytime' },
              { href: '/colleges', icon: '🏫', label: 'Browse Colleges', desc: '10,000+ institutions' },
              { href: '/exams', icon: '📅', label: 'Exam Calendar', desc: 'JEE, NEET, CAT & more' },
            ].map(({ href, icon, label, desc }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center text-center p-4 rounded-xl border hover:border-brand-400 hover:shadow-md transition-all group">
                <span className="text-2xl mb-2">{icon}</span>
                <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600">{label}</div>
                <div className="text-xs text-slate-500 mt-1">{desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Streams */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold mb-4">Browse by Stream</h2>
          <div className="flex flex-wrap gap-2">
            {streamsList.map(s => (
              <Link key={s.id} href={`/colleges?stream=${s.slug}`}
                className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-brand-50 hover:border-brand-400 transition-colors">
                {s.short}
              </Link>
            ))}
          </div>
        </section>

        {/* Featured colleges */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Colleges by NIRF Rank</h2>
            <Link href="/colleges" className="text-brand-600 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map(c => <CollegeCard key={c.id} college={c} />)}
          </div>
        </section>

        {/* Latest articles */}
        <section className="max-w-7xl mx-auto px-4 py-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Latest News & Guides</h2>
            <Link href="/articles" className="text-brand-600 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>

        {/* Anti-ragging notice — mandatory UGC */}
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm">
            <span className="font-semibold text-amber-800">Anti-Ragging Helpline: </span>
            <a href="tel:18001805522" className="text-amber-700 font-bold">1800-180-5522</a>
            <span className="text-amber-700"> (Free, 24×7) · </span>
            <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">antiragging.in</a>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-400 text-sm py-10 md:pb-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-white font-bold text-lg mb-2">GyanSanchaar</div>
            <div className="text-xs leading-relaxed">Education discovery platform for India. DPDP Act 2023 compliant.</div>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Explore</div>
            <ul className="space-y-1"><li><Link href="/colleges" className="hover:text-white">Colleges</Link></li><li><Link href="/courses" className="hover:text-white">Courses</Link></li><li><Link href="/exams" className="hover:text-white">Exams</Link></li></ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Support</div>
            <ul className="space-y-1"><li><Link href="/grievance" className="hover:text-white">Grievance</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li><li><Link href="/about" className="hover:text-white">About</Link></li></ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Legal</div>
            <ul className="space-y-1"><li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li><li><Link href="/terms" className="hover:text-white">Terms</Link></li><li><Link href="/grievance-policy" className="hover:text-white">Grievance Policy</Link></li></ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500">
          © {new Date().getFullYear()} GyanSanchaar. All rights reserved. CIN: {process.env.NEXT_PUBLIC_COMPANY_CIN ?? ""}
        </div>
      </footer>

      <MobileNav />
    </>
  )
}
