import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-heading text-muted text-sm pt-14 pb-20 md:pb-14">
      <div className="max-w-container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {/* Brand col */}
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
            { heading: 'Students', links: [['Colleges', '/colleges'], ['Courses', '/courses'], ['Exams', '/exams'], ['Apply', '/register']] },
            { heading: 'Company',  links: [['About', '/about'], ['News', '/articles'], ['Contact', '/contact'], ['Grievance', '/grievance']] },
            { heading: 'Legal',    links: [['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Grievance Policy', '/grievance-policy'], ['Refund', '/refund']] },
          ].map(col => (
            <div key={col.heading}>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-4">{col.heading}</div>
              <ul className="space-y-2.5">
                {col.links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="hover:text-white transition-colors text-xs">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-2 pt-6 text-xs text-white/30">
          <span>© {new Date().getFullYear()} GyanSanchaar. All rights reserved.{process.env.NEXT_PUBLIC_COMPANY_CIN ? ` CIN: ${process.env.NEXT_PUBLIC_COMPANY_CIN}` : ''}</span>
          <span>Regulated under UGC Act · DPDP Act 2023</span>
        </div>
      </div>
    </footer>
  )
}
