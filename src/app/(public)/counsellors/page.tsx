import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import {
  Star, Clock, BadgeCheck, Users, MessageCircle,
  GraduationCap, ArrowRight, Shield
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free College Counselling — Talk to a Verified Counsellor | GyanSanchaar',
  description: 'Book a free 30-minute session with a verified, unbiased counsellor. No commissions. No steering.',
}

const COUNSELLORS = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    photo: null,
    initials: 'PS',
    expertise: ['Engineering', 'IIT/NIT', 'JEE Strategy'],
    experience: 12,
    sessions: 840,
    rating: 4.9,
    bio: 'Former IIT Delhi faculty with 12 years helping students navigate JEE and engineering admissions across India.',
    available: true,
  },
  {
    id: 2,
    name: 'Rajesh Nair',
    photo: null,
    initials: 'RN',
    expertise: ['Medical', 'NEET', 'MBBS Abroad'],
    experience: 9,
    sessions: 620,
    rating: 4.8,
    bio: 'NEET specialist and former admissions officer at a leading medical college. Helped 600+ students secure MBBS seats.',
    available: true,
  },
  {
    id: 3,
    name: 'Ananya Krishnan',
    photo: null,
    initials: 'AK',
    expertise: ['Management', 'MBA', 'CAT/XAT'],
    experience: 7,
    sessions: 490,
    rating: 4.9,
    bio: 'MBA from IIM Bangalore. Specialises in helping students choose the right B-school based on career goals, not rankings alone.',
    available: false,
  },
  {
    id: 4,
    name: 'Mohammed Salim',
    photo: null,
    initials: 'MS',
    expertise: ['Law', 'CLAT', 'NLU Admissions'],
    experience: 8,
    sessions: 330,
    rating: 4.7,
    bio: 'Practising advocate and CLAT mentor. Guides students through the NLU selection process with honest, unbiased advice.',
    available: true,
  },
  {
    id: 5,
    name: 'Deepika Menon',
    photo: null,
    initials: 'DM',
    expertise: ['Design', 'Architecture', 'NATA/NID'],
    experience: 6,
    sessions: 280,
    rating: 4.8,
    bio: 'Portfolio reviewer and design educator. Helps students build strong NATA and NID applications from scratch.',
    available: true,
  },
  {
    id: 6,
    name: 'Suresh Patel',
    photo: null,
    initials: 'SP',
    expertise: ['Commerce', 'CA Foundation', 'B.Com'],
    experience: 10,
    sessions: 510,
    rating: 4.7,
    bio: 'Chartered Accountant with a decade of mentoring students in commerce streams, CA prep and BCom college selection.',
    available: false,
  },
]

const COLORS = [
  'from-primary to-accent',
  'from-[#0D9488] to-[#0284C7]',
  'from-[#7C3AED] to-[#6366F1]',
  'from-[#DC2626] to-[#F59E0B]',
  'from-[#059669] to-[#0D9488]',
  'from-[#1D4ED8] to-[#0D9488]',
]

export default function CounsellorsPage() {
  return (
    <>
      <Header />
      <main className="bg-white pb-24 md:pb-0">

        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white py-16">
          <div className="max-w-container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-success" /> No commissions · No bias · Verified experts
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Talk to a Verified<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                College Counsellor
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              30-minute sessions. Free. No one here is paid to recommend a college.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-success" /> Background-verified counsellors</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Book in 60 seconds</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> 3,200+ sessions done</span>
            </div>
          </div>
        </section>

        {/* ── Filter strip ── */}
        <div className="border-b border-border bg-white sticky top-16 z-30">
          <div className="max-w-container mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {['All', 'Engineering', 'Medical', 'Management', 'Law', 'Design', 'Commerce'].map(f => (
              <button key={f}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border
                  ${f === 'All'
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-body hover:border-primary hover:text-primary'
                  }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Card/Counsellor grid ── */}
        <section className="max-w-container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COUNSELLORS.map((c, i) => (
              <div key={c.id}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col">

                {/* Photo / gradient avatar */}
                <div className={`h-32 bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center relative`}>
                  {c.photo
                    ? <img src={c.photo} alt={c.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                    : (
                      <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg">
                        {c.initials}
                      </div>
                    )
                  }
                  {/* Availability dot */}
                  <div className={`absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border
                    ${c.available
                      ? 'bg-success/20 border-success/30 text-green-300'
                      : 'bg-white/10 border-white/20 text-white/50'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.available ? 'bg-success' : 'bg-white/40'}`} />
                    {c.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Name */}
                  <h3 className="font-bold text-heading text-base mb-0.5">{c.name}</h3>

                  {/* Rating + experience */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      <strong className="text-heading">{c.rating}</strong>
                    </span>
                    <span>·</span>
                    <span>{c.experience} yrs experience</span>
                    <span>·</span>
                    <span>{c.sessions}+ sessions</span>
                  </div>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.expertise.map(tag => (
                      <span key={tag} className="bg-primary-light text-primary text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-body text-xs leading-relaxed flex-1 mb-5">{c.bio}</p>

                  {/* CTA: Book Slot */}
                  <button
                    disabled={!c.available}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                      ${c.available
                        ? 'bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/30'
                        : 'bg-slate-100 text-muted cursor-not-allowed'
                      }`}>
                    <MessageCircle className="w-4 h-4" />
                    {c.available ? 'Book Free Slot' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="bg-primary-light border-y border-border py-10">
          <div className="max-w-container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: BadgeCheck, title: 'Background Verified', desc: 'Every counsellor is verified against their claimed qualifications and experience.' },
              { icon: Shield,     title: 'Zero Commission Model', desc: 'No counsellor on GyanSanchaar earns a referral fee from any college.' },
              { icon: Clock,      title: '30-Min Free Session', desc: 'No credit card needed. Book, attend and decide — no strings attached.' },
            ].map(t => (
              <div key={t.title} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center mb-3 shadow-card">
                  <t.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="font-bold text-heading text-sm mb-1">{t.title}</div>
                <div className="text-body text-xs leading-relaxed max-w-xs">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <MobileNav />
    </>
  )
}
