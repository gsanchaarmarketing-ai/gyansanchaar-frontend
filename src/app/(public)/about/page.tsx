import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About GyanSanchaar — India\'s College Application Platform',
  description: 'GyanSanchaar helps students discover and apply to verified colleges across India with zero agent fees, DPDP-compliant data practices, and direct admissions.',
  openGraph: {
    title: 'About GyanSanchaar',
    description: 'Bringing order, access and verified clarity to India\'s most important decision.',
  },
}

const TEAM = [
  { name: 'Admissions Intelligence', desc: 'Data-backed college matching powered by NIRF, NAAC, and real admission outcomes.' },
  { name: 'Zero Agent Model', desc: 'No commissions. Every college listed is verified. Every counsellor is paid by us, not by colleges.' },
  { name: 'Privacy by Design', desc: 'Built for DPDP Act 2023 from day one. Your data is yours — request erasure anytime.' },
  { name: 'Rural First', desc: 'Hindi-language support, low-bandwidth UI, and WhatsApp-first notifications for Bharat.' },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pb-24 md:pb-12">
        <div className="mb-10">
          <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Who we are</div>
          <h1 className="text-4xl font-extrabold text-heading mb-4">
            Making college admissions honest, fast and accessible
          </h1>
          <p className="text-body text-lg leading-relaxed max-w-2xl">
            GyanSanchaar is an Indian education technology platform that connects students to verified colleges
            across India — without middlemen, without misinformation, and without fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {TEAM.map(({ name, desc }) => (
            <div key={name} className="bg-primary-light rounded-2xl p-6 border border-border">
              <h2 className="font-bold text-heading mb-2">{name}</h2>
              <p className="text-body text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-heading text-white rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold mb-3">Our mission</h2>
          <p className="text-white/70 leading-relaxed">
            Every year, crores of Indian students make the most important decision of their lives with incomplete
            information, under pressure from agents who profit from confusion. We exist to fix that — with
            transparent data, direct college relationships, and technology built specifically for the Indian student.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6">
          <h2 className="font-bold text-heading mb-4">Compliance & trust</h2>
          <ul className="text-body text-sm space-y-2">
            <li>✅ DPDP Act 2023 compliant — consent-first data processing</li>
            <li>✅ IT Rules 2021 (Intermediary Guidelines) — grievance officer appointed</li>
            <li>✅ UGC Act — only UGC-recognised institutions listed</li>
            <li>✅ Consumer Protection (E-Commerce) Rules 2020 — no dark patterns</li>
            <li>✅ Anti-Ragging Helpline prominently displayed: <a href="tel:18001805522" className="text-primary font-semibold">1800-180-5522</a></li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4 flex-wrap text-sm">
          <Link href="/contact" className="text-primary font-semibold hover:underline">Contact us →</Link>
          <Link href="/grievance" className="text-primary font-semibold hover:underline">File a grievance →</Link>
          <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy policy →</Link>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
