import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ApplyButton from '@/components/dashboard/ApplyButton'
import { MapPin, Award, Globe, Phone } from 'lucide-react'
import { formatFee } from '@/lib/utils'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: c } = await publicApi.college(params.slug)
    return {
      title: `${c.name} — Admissions, Courses, Fees | GyanSanchaar`,
      description: `${c.name} in ${c.city}. Type: ${c.type}. NIRF Rank: ${c.nirf_rank ?? 'N/A'}. View courses, fees, admission process.`,
    }
  } catch { return { title: 'College Not Found' } }
}

export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  let college
  try {
    const res = await publicApi.college(params.slug)
    college = res.data
  } catch { notFound() }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: college.name,
    address: { '@type': 'PostalAddress', addressLocality: college.city, addressCountry: 'IN' },
    ...(college.nirf_rank && { award: `NIRF Rank ${college.nirf_rank}` }),
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="pb-24 md:pb-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 text-white py-10">
          <div className="max-w-5xl mx-auto px-4 flex items-start gap-5">
            {college.logo_path ? (
              <img src={college.logo_path} alt={college.name} className="w-20 h-20 rounded-xl bg-white object-contain p-1" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-3xl font-bold">
                {college.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{college.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-brand-200 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{college.city}{college.state ? `, ${college.state.name}` : ''}</span>
                {college.nirf_rank && <span className="flex items-center gap-1"><Award className="w-3 h-3" />NIRF #{college.nirf_rank}</span>}
                {college.naac_grade && <span className="bg-white/10 px-2 py-0.5 rounded-full">NAAC {college.naac_grade}</span>}
                <span className="bg-white/10 px-2 py-0.5 rounded-full capitalize">{college.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {college.about && (
              <section>
                <h2 className="text-lg font-bold mb-2">About</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{college.about}</p>
              </section>
            )}

            {college.courses && college.courses.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-3">Courses Offered</h2>
                <div className="space-y-2">
                  {college.courses.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{c.level?.toUpperCase()} · {c.duration_months}mo</span>
                      </div>
                      <span className="text-slate-600 font-medium">{formatFee((c as any).pivot?.fee ?? c.default_fee)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Anti-ragging */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <div className="font-semibold text-amber-800 mb-1">Anti-Ragging Notice</div>
              <p className="text-amber-700">Ragging is prohibited and punishable. If you face ragging, call the UGC helpline: <strong>1800-180-5522</strong> (free, 24×7) or visit <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline">antiragging.in</a></p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-brand-600 rounded-xl p-5 text-white text-center">
              <div className="font-bold text-lg mb-1">Apply Now</div>
              <div className="text-brand-100 text-sm mb-4">Use your saved profile — no need to refill</div>
              <ApplyButton collegeId={college.id} collegeName={college.name} courses={college.courses ?? []} />
            </div>

            <div className="border rounded-xl p-4 text-sm space-y-3">
              {college.website && <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-600 hover:underline"><Globe className="w-4 h-4" />Official website</a>}
              {college.contact_email && <div className="flex items-center gap-2 text-slate-600 break-all"><Phone className="w-4 h-4 flex-shrink-0" />{college.contact_email}</div>}
              {college.approvals && <div className="text-slate-500 text-xs">Approved by: {college.approvals}</div>}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
