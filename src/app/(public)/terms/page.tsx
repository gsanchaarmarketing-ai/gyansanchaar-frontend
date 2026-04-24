import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: 'Terms of Service — GyanSanchaar',
  description: 'Terms of Service for GyanSanchaar. Understand your rights and obligations when using India\'s college application platform.',
}

const EFFECTIVE = '1 April 2026'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12 prose prose-sm prose-slate max-w-none">
        <h1 className="text-3xl font-extrabold text-heading not-prose mb-1">Terms of Service</h1>
        <p className="text-muted text-sm not-prose mb-8">Effective: {EFFECTIVE} · Version 1.0</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">1. Acceptance</h2>
          <p className="text-body text-sm leading-relaxed">
            By accessing or using GyanSanchaar (<strong>gyansanchaar.com</strong>), you agree to these Terms.
            If you are under 18, your parent or guardian must also consent. These Terms are governed by the
            laws of India; any disputes are subject to the exclusive jurisdiction of courts in Assam.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">2. Services</h2>
          <p className="text-body text-sm leading-relaxed">
            GyanSanchaar provides college discovery, application submission, counsellor booking, and
            exam information services. We are an intermediary platform as defined under the IT Act 2000
            and IT (Intermediary Guidelines) Rules 2021. We do not guarantee admission to any college.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">3. Eligibility</h2>
          <p className="text-body text-sm leading-relaxed">
            You must be at least 13 years old to register. Students under 18 require verifiable parental
            consent as mandated by the Digital Personal Data Protection Act 2023, Section 9. We will
            request and record this consent before processing your application data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">4. Accurate information</h2>
          <p className="text-body text-sm leading-relaxed">
            You must provide truthful, accurate information in your application. Submitting false academic
            documents is a criminal offence under Section 420 and Section 471 of the Indian Penal Code (now
            Bharatiya Nyaya Sanhita, BNS 2023). GyanSanchaar reserves the right to suspend accounts and
            notify the relevant college if fraud is suspected.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">5. Our charges</h2>
          <p className="text-body text-sm leading-relaxed">
            GyanSanchaar does not charge students any registration or application fee. We earn revenue
            from partner colleges via a service agreement. Counsellor sessions may be offered free or at
            a fee disclosed before booking. Any fee charged will follow our Refund Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">6. Intellectual property</h2>
          <p className="text-body text-sm leading-relaxed">
            All content on GyanSanchaar — including college descriptions, ranking data, UI design, and
            editorial articles — is owned by GyanSanchaar or used under licence. You may not scrape,
            reproduce, or redistribute our data without prior written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">7. Limitation of liability</h2>
          <p className="text-body text-sm leading-relaxed">
            To the extent permitted by applicable Indian law, GyanSanchaar's total liability for any claim
            arising from these Terms shall not exceed ₹10,000 or the amount paid by you in the preceding
            12 months, whichever is lower. We are not liable for college admission decisions, course
            availability, or fee changes made by colleges.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">8. Termination</h2>
          <p className="text-body text-sm leading-relaxed">
            We may suspend or terminate your account if you violate these Terms, submit fraudulent data,
            or engage in abusive behaviour. You may delete your account and request data erasure at any
            time via your Privacy dashboard.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">9. Grievance</h2>
          <p className="text-body text-sm leading-relaxed">
            If you have a complaint about these Terms or our services, please use our{' '}
            <a href="/grievance" className="text-primary font-semibold">Grievance Redressal</a> process.
            We will acknowledge within 24 hours and resolve within 15 days as required by IT Rules 2021.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-heading mb-3">10. Changes</h2>
          <p className="text-body text-sm leading-relaxed">
            We may update these Terms from time to time. We will notify you via email or WhatsApp at least
            7 days before material changes take effect. Continued use constitutes acceptance.
          </p>
        </section>

        <div className="mt-8 text-xs text-muted border-t border-border pt-4">
          GyanSanchaar · Guwahati, Assam, India ·{' '}
          <a href="mailto:support@gyansanchaar.com" className="text-primary">support@gyansanchaar.com</a>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
