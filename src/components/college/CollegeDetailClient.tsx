'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getClientToken } from '@/lib/client-auth'
import { studentApi } from '@/lib/api'
import {
  MapPin, Award, Globe, Mail, BadgeCheck,
  ChevronRight, MessageCircle, BookOpen, IndianRupee,
  TrendingUp, Home, ArrowLeft, Star, Users, Clock,
  ExternalLink,
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
              {college.about && (<section><h2 className="text-lg font-bold text-heading mb-3">About {college.name}</h2><p className="text-body text-sm leading-relaxed">{college.about}</p></section>)}
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
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="text-base font-bold text-heading mb-4">Official Contact</h2>
                <div className="space-y-3">
                  {college.website ? (
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary-light transition-colors group">
                      <Globe className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0"><div className="text-xs font-bold text-muted uppercase tracking-wider">Official Website</div><div className="text-sm text-primary truncate">{college.website}</div></div>
                      <ExternalLink className="w-4 h-4 text-muted group-hover:text-primary" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-slate-50"><Globe className="w-5 h-5 text-muted shrink-0" /><div><div className="text-xs font-bold text-muted uppercase tracking-wider">Official Website</div><div className="text-xs text-muted">Not listed</div></div></div>
                  )}
                  {college.contact_email ? (
                    <a href={`mailto:${college.contact_email}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary-light transition-colors">
                      <Mail className="w-5 h-5 text-primary shrink-0" /><div><div className="text-xs font-bold text-muted uppercase tracking-wider">Admissions Email</div><div className="text-sm text-primary">{college.contact_email}</div></div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-slate-50"><Mail className="w-5 h-5 text-muted shrink-0" /><div><div className="text-xs font-bold text-muted uppercase tracking-wider">Admissions Email</div><div className="text-xs text-muted">Not listed</div></div></div>
                  )}
                  {college.address && (<div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-slate-50"><MapPin className="w-5 h-5 text-muted shrink-0 mt-0.5" /><div><div className="text-xs font-bold text-muted uppercase tracking-wider">Address</div><div className="text-sm text-body">{college.address}</div></div></div>)}
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
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">Fee Structure</h2>
              {courses.length === 0 ? <p className="text-muted text-sm">Fee information not available yet.</p> : (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50 border-b border-border"><th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Programme</th><th className="text-left px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Duration</th><th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Annual Fee</th><th className="text-right px-4 py-3 text-xs font-bold text-heading uppercase tracking-wider">Total Fee</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {courses.map((c: any) => {
                          const annualFee = c.pivot?.fee ?? c.default_fee ?? 0
                          const years = Math.ceil((c.duration_months ?? 24) / 12)
                          return (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-heading">{c.name}</td>
                              <td className="px-4 py-3 text-body">{years} yr</td>
                              <td className="px-4 py-3 text-right text-body">{annualFee ? `₹${Number(annualFee).toLocaleString('en-IN')}` : '—'}</td>
                              <td className="px-4 py-3 text-right font-bold text-heading">{annualFee ? `₹${Number(annualFee * years).toLocaleString('en-IN')}` : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted">* Fees are indicative. Verify with the college before applying.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Placements' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Placement Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[{ icon: TrendingUp, label: 'Avg Package', value: 'Contact college' }, { icon: Users, label: 'Placement Rate', value: 'Contact college' }, { icon: Star, label: 'Top Recruiter', value: 'Contact college' }].map(s => (
                  <div key={s.label} className="bg-primary-light rounded-xl p-5 border border-border text-center"><s.icon className="w-6 h-6 text-primary mx-auto mb-2" /><div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{s.label}</div><div className="text-sm text-muted">{s.value}</div></div>
                ))}
              </div>
              <p className="text-xs text-muted bg-slate-50 rounded-xl p-4 border border-border">Placement data is self-reported by colleges. GyanSanchaar verifies against official disclosures where possible.</p>
            </div>
          )}

          {activeTab === 'Hostel' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-heading mb-4">Hostel &amp; Accommodation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ icon: Home, label: 'Hostel Available', value: 'Contact college' }, { icon: Users, label: 'Capacity', value: 'Contact college' }, { icon: IndianRupee, label: 'Hostel Fee', value: 'Contact college' }, { icon: Clock, label: 'Curfew Timings', value: 'Contact college' }].map(s => (
                  <div key={s.label} className="flex items-center gap-4 p-4 border border-border rounded-xl"><div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-primary" /></div><div><div className="text-xs font-bold text-muted uppercase tracking-wider">{s.label}</div><div className="text-sm font-medium text-body mt-0.5">{s.value}</div></div></div>
                ))}
              </div>
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
            <div className="border border-border rounded-2xl p-5 bg-white shadow-card text-sm space-y-2">
              <div className="font-bold text-heading text-sm mb-3">Contact College</div>
              {college.website ? (<a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-xs"><Globe className="w-4 h-4 shrink-0" /> Official Website <ExternalLink className="w-3 h-3" /></a>) : (<div className="flex items-center gap-2 text-muted text-xs"><Globe className="w-4 h-4 shrink-0" /> Website not listed</div>)}
              {college.contact_email ? (<a href={`mailto:${college.contact_email}`} className="flex items-center gap-2 text-primary hover:underline text-xs break-all"><Mail className="w-4 h-4 shrink-0" /> {college.contact_email}</a>) : (<div className="flex items-center gap-2 text-muted text-xs"><Mail className="w-4 h-4 shrink-0" /> Email not listed</div>)}
              {college.approvals && (<div className="text-muted text-xs pt-2 border-t border-border">Approvals: {college.approvals}</div>)}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
