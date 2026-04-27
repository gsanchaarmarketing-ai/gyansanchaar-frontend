'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getClientToken } from '@/lib/client-auth'
import { studentApi } from '@/lib/api'
import {
  MapPin, Award, BadgeCheck,
  ChevronRight, MessageCircle, BookOpen, IndianRupee,
  TrendingUp, Home, ArrowLeft, Star, Users, Clock,
} from 'lucide-react'
import GalleryCarousel from './GalleryCarousel'

const TABS = ['Overview', 'Courses', 'Fees', 'Gallery', 'Placements', 'Hostel'] as const
type Tab = typeof TABS[number]

function ApplyCTA({ college }: { college: any }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'guest' | 'needsProfile' | 'ready'>('loading')

  useEffect(() => {
    getClientToken().then(async token => {
      if (!token) { setAuthState('guest'); return }
      try {
        const me = await studentApi.me(token)
        setAuthState(me.can_submit_application ? 'ready' : 'needsProfile')
      } catch { setAuthState('guest') }
    })
  }, [])

  const courses = college.courses ?? []

  if (authState === 'loading') return (
    <div className="w-full py-3 rounded-xl bg-primary/20 animate-pulse text-white/0 text-sm text-center">Loading...</div>
  )
  if (authState === 'guest') return (
    <Link href="/register" className="block bg-white text-primary font-bold text-sm text-center py-3 rounded-xl hover:bg-primary-light transition-colors w-full">
      Register to Apply Free →
    </Link>
  )
  if (authState === 'needsProfile') return (
    <Link href="/dashboard/application" className="block bg-white text-primary font-bold text-sm text-center py-3 rounded-xl hover:bg-primary-light transition-colors w-full">
      Complete Profile to Apply →
    </Link>
  )
  return <CollegeApplyPicker college={college} courses={courses} />
}

function CollegeApplyPicker({ college, courses }: { college: any; courses: any[] }) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function apply() {
    if (!selectedCourse) return
    setLoading(true)
    try {
      const token = await getClientToken()
      if (!token) { router.push('/login'); return }
      await studentApi.applyToCollege(token, { college_id: college.id, course_id: Number(selectedCourse) })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/applications'), 1500)
    } catch (e: any) {
      if (e?.status === 403) router.push('/dashboard/parental-consent')
      else alert(e?.message ?? 'Apply failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="w-full py-3 rounded-xl bg-success/20 text-success font-semibold text-sm text-center">✓ Applied! Redirecting…</div>
  )
  if (courses.length === 0) return (
    <button onClick={() => router.push('/dashboard/applications')} className="block bg-white text-primary font-bold text-sm text-center py-3 rounded-xl w-full">
      Apply to this College →
    </button>
  )
  return (
    <div className="space-y-2">
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full px-3 py-2 rounded-xl text-slate-900 text-sm border-0 bg-white/90">
        <option value="">Select course…</option>
        {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.level?.toUpperCase()})</option>)}
      </select>
      <button onClick={apply} disabled={loading || !selectedCourse} className="w-full bg-white text-primary font-bold text-sm py-3 rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50">
        {loading ? 'Applying…' : 'Confirm Application →'}
      </button>
    </div>
  )
}

function CourseApplyButton({ college, course }: { college: any; course: any }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function apply() {
    const token = await getClientToken()
    if (!token) { router.push('/register'); return }
    setState('loading')
    try {
      const me = await studentApi.me(token)
      if (!me.can_submit_application) { router.push('/dashboard/application'); return }
      await studentApi.applyToCollege(token, { college_id: college.id, course_id: course.id })
      setState('done')
      setTimeout(() => router.push('/dashboard/applications'), 1200)
    } catch (e: any) {
      alert(e?.message ?? 'Apply failed. Please try again.')
      setState('idle')
    }
  }

  if (state === 'done') return <span className="text-success text-xs font-bold px-3 py-1.5 bg-success/10 rounded-lg">✓ Applied!</span>
  return (
    <button onClick={apply} disabled={state === 'loading'} className="flex-shrink-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60">
      {state === 'loading' ? '…' : 'Apply'}
    </button>
  )
}

export default function CollegeDetailClient({ college, content = {} }: { college: any; content?: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const courses = college.courses ?? []

  return (
    <main className="bg-white min-h-screen pb-24 md:pb-0">
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
                : <span className="text-3xl font-extrabold text-primary">{college.name.charAt(0)}</span>}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-success/20 border border-success/30 text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full"><BadgeCheck className="w-3 h-3" /> Verified</span>
                {college.ugc_verified && <span className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full"><BadgeCheck className="w-3 h-3" /> UGC Recognised</span>}
                {college.naac_grade && <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">NAAC {college.naac_grade}</span>}
                {college.type && <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-full capitalize">{college.type}</span>}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">{college.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{college.city}{college.state ? `, ${college.state.name}` : ''}</span>
                {college.nirf_rank && <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> NIRF #{college.nirf_rank}</span>}
                {courses.length > 0 && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {courses.length} Courses</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-container mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">

          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {college.about && (<section><h2 className="text-lg font-bold text-heading mb-3">About {college.name}</h2>{college.about.trim().startsWith('<') ? (<div className="prose prose-sm max-w-none text-body leading-relaxed prose-headings:text-heading prose-a:text-primary prose-a:underline prose-ul:list-disc prose-ol:list-decimal" dangerouslySetInnerHTML={{ __html: college.about }} />) : (<p className="text-body text-sm leading-relaxed">{college.about}</p>)}</section>)}
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
              <section className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm">
                <div className="font-semibold text-warning mb-1">Anti-Ragging Notice</div>
                <p className="text-body text-xs leading-relaxed">Ragging is strictly prohibited under UGC Anti-Ragging Regulations 2009. Helpline: <a href="tel:18001805522" className="font-bold text-primary">1800-180-5522</a> (toll-free, 24×7) · <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline text-primary">antiragging.in</a></p>
              </section>
            </div>
          )}

          {activeTab === 'Gallery' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-heading">Campus Gallery</h2>
              {(() => {
                const items: { type: 'image' | 'video'; url: string }[] = []
                if (college.campus_video_url) items.push({ type: 'video', url: college.campus_video_url })
                if (Array.isArray(college.gallery)) college.gallery.forEach((url: string) => items.push({ type: 'image', url }))
                if (items.length === 0) return (
                  <div className="bg-slate-50 border-2 border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-3">🏛️</div>
                    <div className="font-semibold text-heading mb-1">Campus gallery coming soon</div>
                    <div className="text-muted text-sm">Photos and video will appear here once uploaded.</div>
                  </div>
                )
                return <GalleryCarousel items={items} collegeName={college.name} />
              })()}
            </div>
          )}

          {activeTab === 'Courses' && (
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">Courses Offered</h2>
              {courses.length === 0 ? <p className="text-muted text-sm">Course information not available yet.</p> : (
                <div className="space-y-3">
                  {courses.map((c: any) => (
                    <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-heading text-sm">{c.name}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{c.level}</span>
                          {c.duration_months && <span className="text-muted text-xs">{c.duration_months}mo</span>}
                          {(c.pivot?.fee ?? c.default_fee) && <span className="text-muted text-xs">₹{Number(c.pivot?.fee ?? c.default_fee).toLocaleString('en-IN')}/yr</span>}
                          {c.pivot?.branches && <span className="text-muted text-xs">· {c.pivot.branches}</span>}
                        </div>
                      </div>
                      <CourseApplyButton college={college} course={c} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Fees' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-heading">Fee Structure</h2>

              {/* Course fee table */}
              {courses.length === 0 ? (
                <div className="bg-slate-50 border border-border rounded-xl p-8 text-center">
                  <IndianRupee className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">Fee information not available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Programme</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider hidden md:table-cell">Level</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider hidden md:table-cell">Duration</th>
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
                            <td className="px-4 py-3">
                              <div className="font-medium text-heading">{c.name}</div>
                              {c.pivot?.branches && (
                                <div className="text-xs text-muted mt-0.5">{c.pivot.branches}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-body hidden md:table-cell">
                              <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{c.level}</span>
                            </td>
                            <td className="px-4 py-3 text-body hidden md:table-cell">{years} yr</td>
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
              )}

              {/* Fee notes from admin */}
              {college.fee_notes && (
                <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Additional Fee Information</div>
                  {college.fee_notes.trim().startsWith('<') ? (
                    <div className="prose prose-sm max-w-none text-body prose-a:text-primary prose-ul:list-disc" dangerouslySetInnerHTML={{ __html: college.fee_notes }} />
                  ) : (
                    <p className="text-sm text-body leading-relaxed">{college.fee_notes}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted">
                * Fees shown are indicative annual figures. Actual fees may vary by batch, category, and scholarship.
                Verify directly with the college before applying.
              </p>
            </div>
          )}

          {activeTab === 'Placements' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-heading">Placement Statistics</h2>

              {college.placement_data && Object.keys(college.placement_data).length > 0 ? (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {college.placement_data.rate != null && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-extrabold text-indigo-700 leading-none">{college.placement_data.rate}%</div>
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1">Placement Rate</div>
                        {college.placement_data.year && (
                          <div className="text-[10px] text-muted mt-0.5">({college.placement_data.year})</div>
                        )}
                      </div>
                    )}
                    {college.placement_data.avg_package != null && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-extrabold text-emerald-700 leading-none">
                          ₹{college.placement_data.avg_package}<span className="text-base font-semibold">L</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">Avg Package</div>
                        <div className="text-[10px] text-muted mt-0.5">per annum</div>
                      </div>
                    )}
                    {college.placement_data.highest_package != null && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-extrabold text-amber-700 leading-none">
                          ₹{college.placement_data.highest_package}<span className="text-base font-semibold">L</span>
                        </div>
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">Highest Package</div>
                        <div className="text-[10px] text-muted mt-0.5">per annum</div>
                      </div>
                    )}
                  </div>

                  {/* Top recruiters */}
                  {college.placement_data.top_recruiters && (
                    <div className="bg-white border border-border rounded-xl p-4">
                      <div className="text-xs font-bold text-heading uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-warning" /> Top Recruiters
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {college.placement_data.top_recruiters.split(',').map((r: string) => (
                          <span key={r.trim()} className="px-3 py-1 bg-slate-100 text-body text-xs rounded-full font-medium">
                            {r.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {college.placement_data.notes && (
                    <p className="text-xs text-body italic bg-slate-50 rounded-xl p-4 border border-border leading-relaxed">
                      {college.placement_data.notes}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 border border-border rounded-xl p-10 text-center">
                  <TrendingUp className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="font-semibold text-heading text-sm mb-1">Placement data not yet available</p>
                  <p className="text-muted text-xs">Contact the college admissions office for the latest placement report.</p>
                </div>
              )}

              <p className="text-xs text-muted bg-slate-50 rounded-xl p-3 border border-border">
                Placement data is sourced from the college and verified against official disclosures where possible.
                GyanSanchaar does not guarantee placement outcomes.
              </p>
            </div>
          )}

          {activeTab === 'Hostel' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-heading">Hostel & Accommodation</h2>

              {college.hostel_info && Object.keys(college.hostel_info).length > 0 ? (
                <>
                  {/* Availability badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Boys Hostel',   val: college.hostel_info.boys_hostel,    icon: Home },
                      { label: 'Girls Hostel',  val: college.hostel_info.girls_hostel,   icon: Home },
                      { label: 'Mess / Canteen',val: college.hostel_info.mess_available, icon: Users },
                      { label: 'AC Rooms',      val: college.hostel_info.ac_rooms,       icon: Star },
                    ].map(({ label, val, icon: Icon }) => (
                      <div key={label}
                        className={`rounded-xl p-4 border text-center ${
                          val ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-border'
                        }`}>
                        <Icon className={`w-6 h-6 mx-auto mb-1.5 ${val ? 'text-emerald-600' : 'text-muted'}`} />
                        <div className={`text-xs font-semibold ${val ? 'text-emerald-700' : 'text-muted'}`}>{label}</div>
                        <div className={`text-[10px] font-bold mt-0.5 ${val ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {val ? '✓ Available' : '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {college.hostel_info.capacity != null && (
                      <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-white">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-muted uppercase tracking-wider">Capacity</div>
                          <div className="text-sm font-semibold text-heading mt-0.5">
                            {Number(college.hostel_info.capacity).toLocaleString('en-IN')} beds
                          </div>
                        </div>
                      </div>
                    )}
                    {college.hostel_info.fee_per_year != null && (
                      <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-white">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                          <IndianRupee className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-muted uppercase tracking-wider">Annual Fee</div>
                          <div className="text-sm font-semibold text-heading mt-0.5">
                            ₹{Number(college.hostel_info.fee_per_year).toLocaleString('en-IN')}/yr
                          </div>
                        </div>
                      </div>
                    )}
                    {college.hostel_info.curfew && (
                      <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-white">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-muted uppercase tracking-wider">Curfew</div>
                          <div className="text-sm font-semibold text-heading mt-0.5">{college.hostel_info.curfew}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {college.hostel_info.notes && (
                    <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
                      <p className="text-sm text-body leading-relaxed">{college.hostel_info.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 border border-border rounded-xl p-10 text-center">
                  <Home className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="font-semibold text-heading text-sm mb-1">Hostel information not yet available</p>
                  <p className="text-muted text-xs">Contact the college for accommodation details and current availability.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-accent-gradient rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
              <div className="font-bold text-lg mb-1">Apply to {college.name}</div>
              <div className="text-white/70 text-xs mb-5">Use your saved profile — no refilling forms</div>
              <ApplyCTA college={college} />
              <div className="flex items-center gap-2 text-white/60 text-xs justify-center mt-3"><BadgeCheck className="w-3.5 h-3.5 text-success" /> Free · No agent fees · Direct admission</div>
            </div>
            <div className="border border-border rounded-2xl p-5 bg-white shadow-card">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div><div><div className="font-bold text-heading text-sm">Talk to a Counsellor</div><div className="text-muted text-xs">Free · Unbiased · 30 min</div></div></div>
              <Link href="/dashboard/counselling" className="block border border-primary text-primary font-semibold text-sm text-center py-2.5 rounded-xl hover:bg-primary-light transition-colors w-full">Book Free Session</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
