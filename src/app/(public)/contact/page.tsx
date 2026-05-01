import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getCmsContent } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact GyanSanchaar — Support & Grievances',
  description: 'Contact the GyanSanchaar team for support, partnership queries, or to file a grievance. Response within 24 hours.',
}

export const revalidate = 86400

export default async function ContactPage() {
  let officer = null
  // grievance officer loaded from site_contents

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12">
        <h1 className="text-3xl font-extrabold text-heading mb-2">Get in touch</h1>
        <p className="text-body mb-10">We respond within 24 hours on working days (Mon–Sat, 9 AM–6 PM IST).</p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-primary-light border border-border rounded-2xl p-6">
            <Mail className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-bold text-heading mb-1">Student support</h2>
            <a href="mailto:support@gyansanchaar.com" className="text-primary text-sm font-semibold">support@gyansanchaar.com</a>
          </div>
          <div className="bg-primary-light border border-border rounded-2xl p-6">
            <Phone className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-bold text-heading mb-1">Phone support</h2>
            <p className="text-body text-sm">Mon–Sat, 9 AM to 6 PM IST</p>
          </div>
          <div className="bg-primary-light border border-border rounded-2xl p-6">
            <MapPin className="w-6 h-6 text-primary mb-3" />
            <h2 className="font-bold text-heading mb-1">Partnerships & colleges</h2>
            <a href="mailto:colleges@gyansanchaar.com" className="text-primary text-sm font-semibold">colleges@gyansanchaar.com</a>
          </div>
        </div>

        {officer && (
          <div className="border border-warning/30 bg-warning/5 rounded-2xl p-6">
            <h2 className="font-bold text-heading mb-1">Grievance officer</h2>
            <p className="text-body text-xs mb-3">
              As required by IT (Intermediary Guidelines) Rules 2021 and DPDP Act 2023, we have a designated
              Grievance Officer. You will receive acknowledgement within <strong>48 hours</strong> and
              resolution within <strong>30 days</strong>.
            </p>
            <div className="text-sm space-y-1">
              <div><strong>Grievance Officer</strong></div>
              <div><a href="mailto:grievance@gyansanchaar.com" className="text-primary">grievance@gyansanchaar.com</a></div>
            </div>
            <a href="/grievance" className="inline-block mt-4 text-primary text-sm font-semibold hover:underline">
              File a grievance online →
            </a>
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
