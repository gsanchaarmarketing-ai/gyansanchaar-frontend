'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Award, Globe, Phone, BadgeCheck, GraduationCap,
  ChevronRight, MessageCircle, BookOpen, IndianRupee,
  TrendingUp, Home, ArrowLeft, Star, Users, Clock
} from 'lucide-react'

const TABS = ['Overview', 'Courses', 'Fees', 'Placements', 'Hostel'] as const
type Tab = typeof TABS[number]

export default function CollegeDetailClient({ college }: { college: any }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const courses = college.courses ?? []

  return (
    <main className="bg-white min-h-screen pb-24 md:pb-0">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white">
        <div className="max-w-container mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
            <Link href="/colleges" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Colleges
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{college.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-xl shrink-0">
              {college.logo_path
                ? <img src={college.logo_path} alt={college.name} className="w-20 h-20 object-contain" />
                : <span className="text-3xl font-extrabold text-primary">{college.name.charAt(0)}</span>
              }
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Badge/Verified */}
                <span className="inline-flex items-center gap-1 bg-success/20 border border-success/30 text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
                {/* Tag/Quota */}
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
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> NIRF #{college.nirf_rank}
                  </span>
                )}
                {courses.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {courses.length} Courses
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="border-t border-white/10">
          <div className="max-w-container mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab
                      ? 'border-white text-white'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY: 2-column grid ── */}
      <div className="max-w-container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── MAIN CONTENT ── */}
        <div className="lg:col-span-2">

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {college.about && (
                <section>
                  <h2 className="text-lg font-bold text-heading mb-3">About {college.name}</h2>
                  <p className="text-body text-sm leading-relaxed">{college.about}</p>
                </section>
              )}

              {/* Quick facts */}
              <section>
                <h2 className="text-lg font-bold text-heading mb-4">Quick Facts</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Type', value: college.type },
                    { label: 'City', value: college.city },
                    { label: 'NIRF Rank', value: college.nirf_rank ? `#${college.nirf_rank}` : 'N/A' },
                    { label: 'NAAC Grade', value: college.naac_grade ?? 'N/A' },
                    { label: 'Approved By', value: college.approvals ?? 'UGC' },
                    { label: 'Courses', value: `${courses.length}+` },
                  ].map(f => (
                    <div key={f.label} className="bg-primary-light rounded-xl p-4 border border-border">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{f.label}</div>
                      <div className="text-sm font-semibold text-heading capitalize">{f.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Anti-ragging notice */}
              <section className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm">
                <div className="font-semibold text-warning mb-1">Anti-Ragging Notice</div>
                <p className="text-body text-xs leading-relaxed">
                  Ragging is prohibited and punishable. If you face ragging, call the UGC helpline:{' '}
                  <strong>1800-180-5522</strong> (free, 24×7) or visit{' '}
                  <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline text-primary">antiragging.in</a>
                </p>
              </section>
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
                          <th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Fee / Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {courses.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-heading">{c.name}</td>
                            <td className="px-4 py-3">
                              <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {c.level}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-body">{c.duration_months}mo</td>
                            <td className="px-4 py-3 text-right font-semibold text-heading">
                              {c.pivot?.fee
                                ? `₹${Number(c.pivot.fee).toLocaleString('en-IN')}`
                                : c.default_fee
                                  ? `₹${Number(c.default_fee).toLocaleString('en-IN')}`
                                  : '—'
                              }
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
                            const totalFee = annualFee * years
                            return (
                              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-heading">{c.name}</td>
                                <td className="px-4 py-3 text-body">{years} {years === 1 ? 'Year' : 'Years'}</td>
                                <td className="px-4 py-3 text-right text-body">
                                  {annualFee ? `₹${Number(annualFee).toLocaleString('en-IN')}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-heading">
                                  {totalFee ? `₹${Number(totalFee).toLocaleString('en-IN')}` : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted">* Fees are indicative and subject to change. Verify with the college directly.</p>
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
                  { icon: TrendingUp, label: 'Avg Package', value: 'Data from college' },
                  { icon: Users,      label: 'Placement Rate', value: 'Data from college' },
                  { icon: Star,       label: 'Top Recruiter', value: 'Data from college' },
                ].map(s => (
                  <div key={s.label} className="bg-primary-light rounded-xl p-5 border border-border text-center">
                    <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm text-muted">{s.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted bg-slate-50 rounded-xl p-4 border border-border">
                Placement data is self-reported by colleges. GyanSanchaar verifies data against official disclosures where possible.
              </p>
            </div>
          )}

          {/* Hostel Tab */}
          {activeTab === 'Hostel' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Hostel &amp; Accommodation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Home,  label: 'Hostel Available', value: 'Contact college' },
                  { icon: Users, label: 'Capacity',          value: 'Contact college' },
                  { icon: IndianRupee, label: 'Hostel Fee',  value: 'Contact college' },
                  { icon: Clock, label: 'Curfew Timings',    value: 'Contact college' },
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
              <p className="text-xs text-muted bg-slate-50 rounded-xl p-4 border border-border">
                For confirmed hostel availability and fees, contact the college admissions office directly.
              </p>
            </div>
          )}
        </div>

        {/* ── STICKY RIGHT PANEL ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">

            {/* Apply Now card */}
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

            {/* Talk to Counsellor card */}
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
              <p className="text-body text-xs leading-relaxed mb-4">
                Get personalised guidance from a verified counsellor who has no incentive to steer you wrong.
              </p>
              <Link href="/counsellors"
                className="block border border-primary text-primary font-semibold text-sm text-center py-2.5 rounded-xl hover:bg-primary-light transition-colors w-full">
                Book Free Slot
              </Link>
            </div>

            {/* Contact card */}
            {(college.website || college.contact_email) && (
              <div className="border border-border rounded-2xl p-5 bg-white shadow-card text-sm space-y-3">
                <div className="font-bold text-heading text-sm mb-2">Contact</div>
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-xs">
                    <Globe className="w-4 h-4 shrink-0" /> Official Website
                  </a>
                )}
                {college.contact_email && (
                  <div className="flex items-center gap-2 text-body text-xs break-all">
                    <Phone className="w-4 h-4 shrink-0 text-muted" /> {college.contact_email}
                  </div>
                )}
                {college.approvals && (
                  <div className="text-muted text-xs pt-2 border-t border-border">Approved by: {college.approvals}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
