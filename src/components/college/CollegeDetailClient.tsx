'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Award, Globe, Mail, BadgeCheck, GraduationCap,
  ChevronRight, MessageCircle, BookOpen, IndianRupee,
  TrendingUp, Home, ArrowLeft, Star, Users, Clock,
  Phone, Play, Image as ImageIcon, ExternalLink
} from 'lucide-react'

const TABS = ['Overview', 'Courses', 'Fees', 'Gallery', 'Placements', 'Hostel'] as const
type Tab = typeof TABS[number]

export default function CollegeDetailClient({ college }: { college: any }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [lightbox, setLightbox] = useState<string | null>(null)

  const courses = college.courses ?? []

  // Sample gallery — replaced by real data when admin uploads
  const gallery: string[] = college.gallery ?? []
  const hasGallery = gallery.length > 0

  return (
    <main className="bg-white min-h-screen pb-24 md:pb-0">

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Campus" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white">
        <div className="max-w-container mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
            <Link href="/colleges" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Colleges
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{college.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-xl shrink-0">
              {college.logo_path
                ? <img src={college.logo_path} alt={college.name} className="w-20 h-20 object-contain" />
                : <span className="text-3xl font-extrabold text-primary">{college.name.charAt(0)}</span>
              }
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-success/20 border border-success/30 text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
                {college.naac_grade && (
                  <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    NAAC {college.naac_grade}
                  </span>
                )}
                {college.type && (
                  <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-full capitalize">
                    {college.type}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">{college.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {college.city}{college.state ? `, ${college.state.name}` : ''}
                </span>
                {college.nirf_rank && (
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> NIRF #{college.nirf_rank}</span>
                )}
                {courses.length > 0 && (
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {courses.length} Courses</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-t border-white/10">
          <div className="max-w-container mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-2">

          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {college.about && (
                <section>
                  <h2 className="text-lg font-bold text-heading mb-3">About {college.name}</h2>
                  <p className="text-body text-sm leading-relaxed">{college.about}</p>
                </section>
              )}
              <section>
                <h2 className="text-lg font-bold text-heading mb-4">Quick Facts</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Type',        value: college.type },
                    { label: 'City',        value: college.city },
                    { label: 'NIRF Rank',   value: college.nirf_rank ? `#${college.nirf_rank}` : 'N/A' },
                    { label: 'NAAC Grade',  value: college.naac_grade ?? 'N/A' },
                    { label: 'Approved By', value: college.approvals ?? 'UGC' },
                    { label: 'Courses',     value: `${courses.length}+` },
                  ].map(f => (
                    <div key={f.label} className="bg-primary-light rounded-xl p-4 border border-border">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{f.label}</div>
                      <div className="text-sm font-semibold text-heading capitalize">{f.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Official links */}
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="text-base font-bold text-heading mb-4">Official Contact</h2>
                <div className="space-y-3">
                  {college.website ? (
                    <a href={college.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary-light transition-colors group">
                      <Globe className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-muted uppercase tracking-wider">Official Website</div>
                        <div className="text-sm text-primary truncate">{college.website}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted group-hover:text-primary" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-slate-50">
                      <Globe className="w-5 h-5 text-muted shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider">Official Website</div>
                        <div className="text-xs text-muted">Not listed — contact admin to add</div>
                      </div>
                    </div>
                  )}
                  {college.contact_email ? (
                    <a href={`mailto:${college.contact_email}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary-light transition-colors">
                      <Mail className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider">Admissions Email</div>
                        <div className="text-sm text-primary">{college.contact_email}</div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-slate-50">
                      <Mail className="w-5 h-5 text-muted shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider">Admissions Email</div>
                        <div className="text-xs text-muted">Not listed</div>
                      </div>
                    </div>
                  )}
                  {college.address && (
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-slate-50">
                      <MapPin className="w-5 h-5 text-muted shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-wider">Address</div>
                        <div className="text-sm text-body">{college.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm">
                <div className="font-semibold text-warning mb-1">Anti-Ragging Notice</div>
                <p className="text-body text-xs leading-relaxed">
                  Ragging is prohibited and punishable. National Anti-Ragging Helpline:{' '}
                  <strong>1800-180-5522</strong> (free, 24×7) ·{' '}
                  <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline text-primary">antiragging.in</a>
                </p>
              </section>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'Gallery' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Campus Gallery</h2>

              {/* Campus video placeholder */}
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                {college.campus_video_url ? (
                  <iframe
                    src={college.campus_video_url}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title="Campus Video"
                  />
                ) : (
                  <div className="text-center text-white/50 p-8">
                    <Play className="w-12 h-12 mx-auto mb-3 text-white/20" />
                    <div className="font-semibold text-sm">Campus Video</div>
                    <div className="text-xs mt-1">Video tour coming soon</div>
                  </div>
                )}
              </div>

              {/* Photo grid */}
              {hasGallery ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((img: string, i: number) => (
                    <button key={i} onClick={() => setLightbox(img)}
                      className="aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity">
                      <img src={img} alt={`${college.name} campus ${i + 1}`}
                        className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}
                      className="aspect-square rounded-xl border-2 border-dashed border-border bg-slate-50 flex flex-col items-center justify-center text-muted">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-30" />
                      <div className="text-[10px]">Photo {i + 1}</div>
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-3 text-center text-xs text-muted py-2">
                    Gallery photos will appear here once uploaded by the college
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'Courses' && (
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">Courses Offered</h2>
              {courses.length === 0
                ? <p className="text-muted text-sm">Course information not available yet.</p>
                : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Course</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Level</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Duration</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Fee/Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {courses.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-heading">{c.name}</td>
                            <td className="px-4 py-3">
                              <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{c.level}</span>
                            </td>
                            <td className="px-4 py-3 text-body">{c.duration_months}mo</td>
                            <td className="px-4 py-3 text-right font-semibold text-heading">
                              {c.pivot?.fee ? `₹${Number(c.pivot.fee).toLocaleString('en-IN')}`
                                : c.default_fee ? `₹${Number(c.default_fee).toLocaleString('en-IN')}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === 'Fees' && (
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">Fee Structure</h2>
              {courses.length === 0
                ? <p className="text-muted text-sm">Fee information not available yet.</p>
                : (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border">
                            <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Programme</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Duration</th>
                            <th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Annual Fee</th>
                            <th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Total Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {courses.map((c: any) => {
                            const annualFee = c.pivot?.fee ?? c.default_fee ?? 0
                            const years = Math.ceil((c.duration_months ?? 24) / 12)
                            return (
                              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-heading">{c.name}</td>
                                <td className="px-4 py-3 text-body">{years} yr</td>
                                <td className="px-4 py-3 text-right text-body">
                                  {annualFee ? `₹${Number(annualFee).toLocaleString('en-IN')}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-heading">
                                  {annualFee ? `₹${Number(annualFee * years).toLocaleString('en-IN')}` : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted">* Fees are indicative. Verify with college before applying.</p>
                  </div>
                )
              }
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'Placements' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Placement Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: TrendingUp, label: 'Avg Package',    value: 'Contact college' },
                  { icon: Users,      label: 'Placement Rate', value: 'Contact college' },
                  { icon: Star,       label: 'Top Recruiter',  value: 'Contact college' },
                ].map(s => (
                  <div key={s.label} className="bg-primary-light rounded-xl p-5 border border-border text-center">
                    <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm text-muted">{s.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted bg-slate-50 rounded-xl p-4 border border-border">
                Placement data is self-reported by colleges. GyanSanchaar verifies against official disclosures where possible.
              </p>
            </div>
          )}

          {/* Hostel Tab */}
          {activeTab === 'Hostel' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Hostel &amp; Accommodation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Home,        label: 'Hostel Available', value: 'Contact college' },
                  { icon: Users,       label: 'Capacity',         value: 'Contact college' },
                  { icon: IndianRupee, label: 'Hostel Fee',        value: 'Contact college' },
                  { icon: Clock,       label: 'Curfew Timings',    value: 'Contact college' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted uppercase tracking-wider">{s.label}</div>
                      <div className="text-sm font-medium text-body mt-0.5">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STICKY RIGHT PANEL */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-accent-gradient rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
              <div className="font-bold text-lg mb-1">Apply to {college.name}</div>
              <div className="text-white/70 text-xs mb-5">Use your saved profile — no need to refill forms</div>
              <Link href="/register"
                className="block bg-white text-primary font-bold text-sm text-center py-3 rounded-xl hover:bg-primary-light transition-colors w-full mb-3">
                Apply Now →
              </Link>
              <div className="flex items-center gap-2 text-white/60 text-xs justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-success" /> Free · No agent fees · Direct admission
              </div>
            </div>

            <div className="border border-border rounded-2xl p-5 bg-white shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-heading text-sm">Talk to a Counsellor</div>
                  <div className="text-muted text-xs">Free · Unbiased · 30 min</div>
                </div>
              </div>
              <Link href="/counsellors"
                className="block border border-primary text-primary font-semibold text-sm text-center py-2.5 rounded-xl hover:bg-primary-light transition-colors w-full">
                Book Free Slot
              </Link>
            </div>

            {/* Always-visible contact card */}
            <div className="border border-border rounded-2xl p-5 bg-white shadow-card text-sm space-y-2">
              <div className="font-bold text-heading text-sm mb-3">Contact College</div>
              {college.website ? (
                <a href={college.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-xs">
                  <Globe className="w-4 h-4 shrink-0" /> Official Website <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-muted text-xs">
                  <Globe className="w-4 h-4 shrink-0" /> Website not listed
                </div>
              )}
              {college.contact_email ? (
                <a href={`mailto:${college.contact_email}`}
                  className="flex items-center gap-2 text-primary hover:underline text-xs break-all">
                  <Mail className="w-4 h-4 shrink-0" /> {college.contact_email}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-muted text-xs">
                  <Mail className="w-4 h-4 shrink-0" /> Email not listed
                </div>
              )}
              {college.approvals && (
                <div className="text-muted text-xs pt-2 border-t border-border">
                  Approvals: {college.approvals}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
