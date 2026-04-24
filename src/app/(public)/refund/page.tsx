import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: 'Refund Policy — GyanSanchaar',
  description: 'GyanSanchaar refund and cancellation policy for counselling sessions and any paid services.',
}

export default function RefundPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12">
        <h1 className="text-3xl font-extrabold text-heading mb-1">Refund & Cancellation Policy</h1>
        <p className="text-muted text-sm mb-8">Effective: 1 April 2026 · Version 1.0</p>

        <div className="bg-success/10 border border-success/30 rounded-2xl p-5 mb-8">
          <p className="text-sm font-semibold text-heading">
            ✅ College applications on GyanSanchaar are <strong>completely free</strong>. There is no registration fee, no application fee, and no agent fee.
          </p>
        </div>

        {[
          {
            title: 'Counsellor sessions',
            body: `Free sessions: No payment, no refund needed.
Paid sessions (if offered): You may cancel up to 4 hours before the scheduled time for a full refund. Cancellations within 4 hours are non-refundable except in cases of counsellor unavailability, for which we will issue a full refund within 5 working days.`,
          },
          {
            title: 'How refunds are processed',
            body: 'Refunds are credited to the original payment method within 5–7 working days. For UPI and net banking, refunds typically arrive within 2–3 days. For credit/debit cards, allow up to 7 days depending on your bank. We do not process refunds in cash.',
          },
          {
            title: 'Requesting a refund',
            body: 'Email support@gyansanchaar.com with your booking ID and the reason. You can also file a grievance via our online form if your refund is not processed within the stated timeline.',
          },
          {
            title: 'Consumer rights',
            body: 'Your rights under the Consumer Protection Act 2019 and Consumer Protection (E-Commerce) Rules 2020 are not affected by this policy. If you believe a charge was unfair or unauthorised, you may also contact the National Consumer Helpline at 1800-11-4000.',
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-base font-bold text-heading mb-2">{title}</h2>
            <p className="text-body text-sm leading-relaxed whitespace-pre-line">{body}</p>
          </section>
        ))}
      </main>
      <MobileNav />
    </>
  )
}
