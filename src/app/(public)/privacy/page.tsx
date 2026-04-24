import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: 'Privacy Policy — GyanSanchaar',
  description: 'GyanSanchaar Privacy Policy. How we collect, use, and protect your personal data in compliance with India\'s DPDP Act 2023.',
}

const EFFECTIVE = '1 April 2026'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12">
        <h1 className="text-3xl font-extrabold text-heading mb-1">Privacy Policy</h1>
        <p className="text-muted text-sm mb-2">Effective: {EFFECTIVE} · Version 1.0</p>
        <p className="text-body text-sm mb-8">
          This policy explains how GyanSanchaar (<strong>"we", "us", "our"</strong>) collects, uses,
          shares, and protects your personal data. We comply with the{' '}
          <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and the{' '}
          <strong>IT (Intermediary Guidelines) Rules 2021</strong>.
        </p>

        {[
          {
            title: '1. Data we collect',
            body: `We collect: (a) Identity data — name, date of birth, email, phone number; (b) Academic data — marksheets, scores, course preferences; (c) Technical data — IP address, device type, browser, session tokens; (d) Communication data — WhatsApp and email interactions; (e) Consent records — timestamped log of every consent you grant or withdraw.
We do not collect: Aadhaar numbers, bank account details, caste certificates, or biometric data.`,
          },
          {
            title: '2. Legal basis for processing',
            body: 'We process your personal data only with your explicit, free, informed, and specific consent as required by DPDP Act 2023, Section 6. For minors under 18, we additionally obtain verifiable parental consent under Section 9. You may withdraw consent at any time via your Privacy dashboard — this will not affect the lawfulness of processing before withdrawal.',
          },
          {
            title: '3. How we use your data',
            body: 'Your data is used to: (a) Process and track your college applications; (b) Send application status updates via WhatsApp and email; (c) Verify your identity via OTP; (d) Provide counsellor booking services; (e) Improve our platform with aggregated, anonymised analytics (only if you consented to analytics).',
          },
          {
            title: '4. Who we share data with',
            body: 'We share your application data only with the colleges you explicitly apply to. We do not sell your data. We may share data with: (a) Cloud hosting providers (data centres within India); (b) Communication service providers for OTP and notifications; (c) Law enforcement if required by a valid court order under Indian law.',
          },
          {
            title: '5. Your rights under DPDP Act 2023',
            body: `You have the right to: (a) Access — request a summary of data we hold about you; (b) Correction — update inaccurate data; (c) Erasure — request deletion of your account and data (subject to statutory retention obligations); (d) Grievance — file a complaint with our Grievance Officer within 30 days of any issue; (e) Nominate — designate a nominee to exercise your rights in the event of death or incapacity.
Exercise these rights via your Privacy dashboard or by emailing dpo@gyansanchaar.com.`,
          },
          {
            title: '6. Data retention',
            body: 'Application data is retained for 3 years after the admission cycle closes, as required for audit purposes. OTP logs are deleted after 10 minutes. Audit logs are retained for 180 days as mandated by CERT-In directions (2022). After the retention period, data is permanently deleted.',
          },
          {
            title: '7. Cookies & analytics',
            body: 'We use strictly necessary cookies for session management. Analytics and marketing cookies (Google Analytics, Meta Pixel) are deployed only after you grant consent via our cookie banner. You may change preferences at any time.',
          },
          {
            title: '8. Data Protection Officer',
            body: 'Our Data Protection Officer can be contacted at dpo@gyansanchaar.com. All DPDP-related requests will be acknowledged within 48 hours.',
          },
          {
            title: '9. Changes to this policy',
            body: 'We will notify you of material changes to this policy at least 7 days in advance via email or WhatsApp. The latest version will always be available at gyansanchaar.com/privacy.',
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-base font-bold text-heading mb-2">{title}</h2>
            <p className="text-body text-sm leading-relaxed whitespace-pre-line">{body}</p>
          </section>
        ))}

        <div className="bg-primary-light border border-border rounded-2xl p-5 mt-8">
          <p className="text-sm text-body">
            Questions? Contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@gyansanchaar.com" className="text-primary font-semibold">dpo@gyansanchaar.com</a>
            {' '}or file a{' '}
            <a href="/grievance" className="text-primary font-semibold">grievance online</a>.
          </p>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
