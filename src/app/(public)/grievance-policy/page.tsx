import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { publicApi } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Grievance Redressal Policy — GyanSanchaar',
  description: 'GyanSanchaar grievance redressal mechanism as required by IT (Intermediary Guidelines) Rules 2021 and DPDP Act 2023.',
}

export const revalidate = 86400

export default async function GrievancePolicyPage() {
  let officer = null
  try { officer = await publicApi.grievanceOfficer() } catch {}

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12">
        <h1 className="text-3xl font-extrabold text-heading mb-1">Grievance Redressal Policy</h1>
        <p className="text-muted text-sm mb-8">Effective: 1 April 2026 · Required under IT (Intermediary Guidelines &amp; Digital Media Ethics Code) Rules 2021, Rule 4(2) and DPDP Act 2023.</p>

        <section className="mb-8">
          <h2 className="text-base font-bold text-heading mb-2">Grievance Officer</h2>
          <p className="text-body text-sm mb-4">
            In compliance with IT Rules 2021, GyanSanchaar has appointed a Grievance Officer. Any student,
            parent, or user may file a complaint with the Grievance Officer.
          </p>
          {officer ? (
            <div className="bg-primary-light border border-border rounded-xl p-5 text-sm space-y-1">
              <div><strong>Name:</strong> {officer.name}</div>
              <div><strong>Email:</strong> <a href={`mailto:${officer.email}`} className="text-primary">{officer.email}</a></div>
              {officer.phone && <div><strong>Phone:</strong> {officer.phone}</div>}
            </div>
          ) : (
            <div className="bg-primary-light border border-border rounded-xl p-5 text-sm">
              <div><strong>Email:</strong> <a href="mailto:grievance@gyansanchaar.com" className="text-primary">grievance@gyansanchaar.com</a></div>
            </div>
          )}
        </section>

        {[
          {
            title: 'Timeline',
            body: `We will acknowledge your grievance within 24 hours of receipt.
We will provide a substantive resolution within 15 calendar days.
For data-related complaints (DPDP Act 2023), resolution within 30 days.
If we cannot resolve within the stated time, we will communicate the reason and a revised timeline.`,
          },
          {
            title: 'How to file a grievance',
            body: 'You can file a grievance: (a) Online via our grievance form at gyansanchaar.com/grievance — preferred, as you receive a ticket ID for tracking; (b) By email to the Grievance Officer directly; (c) By post to our registered address.',
          },
          {
            title: 'What you can complain about',
            body: `Any of the following: (a) Application data not handled as per our Privacy Policy; (b) Admission letter not issued after approval; (c) Counsellor session dispute; (d) Refund not processed within stated timeline; (e) Harassment or inappropriate content; (f) Request to exercise your DPDP rights (access, correction, erasure, nomination) not honoured.`,
          },
          {
            title: 'Escalation',
            body: 'If you are not satisfied with our resolution, you may escalate to: (a) National Consumer Helpline: 1800-11-4000; (b) Ministry of Electronics and IT (MeitY): for IT Rules related complaints; (c) The Data Protection Board of India once constituted under DPDP Act 2023.',
          },
          {
            title: 'Anti-ragging',
            body: 'For anti-ragging complaints related to a college listed on GyanSanchaar, please contact the National Anti-Ragging Helpline: 1800-180-5522 (free, 24×7) or visit antiragging.in. GyanSanchaar will cooperate fully with any investigation.',
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-base font-bold text-heading mb-2">{title}</h2>
            <p className="text-body text-sm leading-relaxed whitespace-pre-line">{body}</p>
          </section>
        ))}

        <div className="mt-8">
          <Link href="/grievance"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm">
            File a grievance now →
          </Link>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
