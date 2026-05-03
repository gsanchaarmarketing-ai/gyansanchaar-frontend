'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { getProfile, applyToCollege } from '@/lib/student-api'
import {
  MapPin, Award, BadgeCheck, ChevronRight, MessageCircle,
  BookOpen, IndianRupee, TrendingUp, Home, ArrowLeft,
  Star, Users, Clock, Building2, Globe, Phone, Mail,
  GraduationCap, Wifi, Dumbbell, FlaskConical, Bus,
  Library, CheckCircle2, AlertTriangle, ExternalLink,
  CalendarDays, Shield, Landmark,
} from 'lucide-react'
import GalleryCarousel from './GalleryCarousel'

/* ── helpers ─────────────────────────────────────────────────────── */
function fmt(n: number) { return n.toLocaleString('en-IN') }

function generateAbout(c: any): string {
  const yr   = c.established_year
  const city = c.city
  const st   = c.state?.name
  const loc  = st ? `${city}, ${st}` : city
  const type = c.type === 'deemed' ? 'a deemed university' : `a ${c.type} institution`
  const nirf = c.nirf_rank ? ` It holds NIRF Rank #${c.nirf_rank} among Indian universities.` : ''
  const naac = c.naac_grade ? ` The National Assessment and Accreditation Council (NAAC) has awarded it a Grade ${c.naac_grade}.` : ''
  const ugc  = c.ugc_verified ? ' The University Grants Commission (UGC) has recognised the institution.' : ''
  const courses = c.courses?.length ? ` It offers ${c.courses.length} programmes spanning undergraduate, postgraduate, and other levels.` : ''

  return `${c.name} is ${type} located in ${loc}${yr ? `, established in ${yr}` : ''}.${nirf}${naac}${ugc}${courses} Students can apply directly through GyanSanchaar at no cost — no agent, no commission.`
}

const FACILITY_ICONS: Record<string, any> = {
  wifi: Wifi, gym: Dumbbell, labs: FlaskConical, transport: Bus,
  library: Library, hostel: Home, cafeteria: Users, sports: Award,
}

/* ── ApplyCTA ─────────────────────────────────────────────────────── */
function ApplyCTA({ college }: { college: any }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'guest' | 'needsProfile' | 'ready'>('loading')

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await createBrowserSupabaseClient().auth.getUser()
      if (!user) { setAuthState('guest'); return }
      try {
        const me: any = await getProfile()
        setAuthState(me.can_submit_application ? 'ready' : 'needsProfile')
      } catch { setAuthState('guest') }
    })()
  }, [])

  if (authState === 'loading') return <div className="h-11 rounded-xl bg-white/20 animate-pulse" />
  if (authState === 'guest') return (
    <Link href="/register" className="block bg-white text-[#1E3A8A] font-bold text-sm text-center py-3 rounded-xl hover:bg-blue-50 transition-colors w-full">
      Register to Apply Free →
    </Link>
  )
  if (authState === 'needsProfile') return (
    <Link href="/dashboard/application" className="block bg-white text-[#1E3A8A] font-bold text-sm text-center py-3 rounded-xl hover:bg-blue-50 transition-colors w-full">
      Complete Profile to Apply →
    </Link>
  )
  return <CollegeApplyPicker college={college} courses={college.courses ?? []} />
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
      await applyToCollege({ college_id: college.id, course_id: Number(selectedCourse) })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/applications'), 1500)
    } catch (e: any) {
      if (e?.status === 403) router.push('/dashboard/parental-consent')
      else alert(e?.message ?? 'Apply failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return <div className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-sm text-center">✓ Applied! Redirecting…</div>
  if (courses.length === 0) return (
    <button onClick={() => router.push('/dashboard/applications')} className="block bg-white text-[#1E3A8A] font-bold text-sm text-center py-3 rounded-xl w-full">
      Apply to this College →
    </button>
  )
  return (
    <div className="space-y-2">
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-slate-900 text-sm bg-white/90 border-0 focus:outline-none">
        <option value="">Select a course…</option>
        {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.level?.toUpperCase()})</option>)}
      </select>
      <button onClick={apply} disabled={loading || !selectedCourse} className="w-full bg-white text-[#1E3A8A] font-bold text-sm py-3 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50">
        {loading ? 'Applying…' : 'Confirm Application →'}
      </button>
    </div>
  )
}

function CourseApplyButton({ college, course }: { college: any; course: any }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function apply() {
    const { data: { user } } = await createBrowserSupabaseClient().auth.getUser()
    if (!user) { router.push('/register'); return }
    setState('loading')
    try {
      const { data: me } = await createBrowserSupabaseClient().from('profiles').select('father_name,address,phone_verified_at').eq('id', user.id).single()
      if (!me?.father_name || !me?.address || !me?.phone_verified_at) { router.push('/dashboard/application'); return }
      await applyToCollege({ college_id: college.id, course_id: course.id })
      setState('done')
      setTimeout(() => router.push('/dashboard/applications'), 1200)
    } catch (e: any) {
      alert(e?.message ?? 'Apply failed. Please try again.')
      setState('idle')
    }
  }

  if (state === 'done') return <span className="text-emerald-600 text-xs font-bold px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">✓ Applied!</span>
  return (
    <button onClick={apply} disabled={state === 'loading'} className="flex-shrink-0 bg-[#1E3A8A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60">
      {state === 'loading' ? '…' : 'Apply Free'}
    </button>
  )
}

/* ── Stat card ────────────────────────────────────────────────────── */
function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-5 text-center`}>
      <div className="text-3xl font-extrabold leading-none mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider mt-1">{label}</div>
      {sub && <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>}
    </div>
  )
}

/* ── Tabs ─────────────────────────────────────────────────────────── */
const TABS = ['Overview', 'Courses & Fees', 'Placements', 'Hostel', 'Gallery'] as const
type Tab = typeof TABS[number]

/* ── Main component ───────────────────────────────────────────────── */
export default function CollegeDetailClient({ college, content = {} }: { college: any; content?: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const courses = college.courses ?? []
  const pd = college.placement_data ?? {}
  const hi = college.hostel_info ?? {}
  const year = new Date().getFullYear()

  const about = college.about?.trim() || generateAbout(college)

  return (
    <main className="bg-[#F8FAFC] min-h-screen pb-28 md:pb-0">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-0">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-white/40 text-xs mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/colleges" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />Colleges
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70 truncate max-w-[160px]">{college.name}</span>
          </nav>

          {/* College identity */}
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-xl shrink-0 flex items-center justify-center">
              {college.logo_path
                ? <img src={college.logo_path} alt={`${college.name} logo`} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                : <span className="text-3xl font-extrabold text-[#1E3A8A]">{college.name.charAt(0)}</span>}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {college.ugc_verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> UGC Recognised
                  </span>
                )}
                {college.naac_grade && (
                  <span className="bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    NAAC {college.naac_grade}
                  </span>
                )}
                {college.nirf_rank && (
                  <span className="bg-blue-400/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    NIRF #{college.nirf_rank}
                  </span>
                )}
                {college.type && (
                  <span className="bg-white/10 text-white/60 text-[10px] font-medium px-2.5 py-1 rounded-full capitalize">
                    {college.type}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                {college.name}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {college.city}{college.state ? `, ${college.state.name}` : ''}
                </span>
                {college.established_year && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />Est. {college.established_year}
                  </span>
                )}
                {courses.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />{courses.length} Courses
                  </span>
                )}
                {college.website && (
                  <a href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Globe className="w-3.5 h-3.5 shrink-0" />Official Website
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto scrollbar-none mt-8 border-t border-white/10">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── OVERVIEW ───────────────────────────────────────────── */}
          {activeTab === 'Overview' && (
            <>
              {/* About */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  About {college.name}
                </h2>
                {about.trim().startsWith('<')
                  ? <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-a:text-blue-600" dangerouslySetInnerHTML={{ __html: about }} />
                  : <p className="text-slate-600 text-sm leading-relaxed">{about}</p>
                }

                {/* Admission note */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <strong>Applying for {year}–{year + 1}?</strong> Submit your application directly through GyanSanchaar — completely free, no agent fees, no hidden charges.
                </div>
              </section>

              {/* Quick facts */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-5">At a Glance</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Institution Type',  value: college.type ?? '—', icon: Building2 },
                    { label: 'Location',           value: college.city ?? '—', icon: MapPin },
                    { label: 'NIRF Rank',          value: college.nirf_rank ? `#${college.nirf_rank}` : 'Not ranked', icon: Award },
                    { label: 'NAAC Grade',         value: college.naac_grade ?? 'Not graded', icon: Shield },
                    { label: 'Established',        value: college.established_year ? `${college.established_year}` : '—', icon: CalendarDays },
                    { label: 'Programmes',         value: courses.length ? `${courses.length}+` : '—', icon: GraduationCap },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{label}</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 capitalize">{value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Placement snapshot (if data exists) */}
              {pd && Object.keys(pd).length > 0 && (
                <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Placement Snapshot</h2>
                    <button onClick={() => setActiveTab('Placements')} className="text-xs text-blue-600 font-semibold hover:underline">View full stats →</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {pd.rate != null && <Stat label="Placement Rate" value={`${pd.rate}%`} sub={pd.year ? `Class of ${pd.year}` : undefined} color="bg-indigo-50 border border-indigo-100 text-indigo-700" />}
                    {pd.avg_package != null && <Stat label="Avg Package" value={`₹${pd.avg_package}L`} sub="per annum" color="bg-emerald-50 border border-emerald-100 text-emerald-700" />}
                    {pd.highest_package != null && <Stat label="Highest Package" value={`₹${pd.highest_package}L`} sub="per annum" color="bg-amber-50 border border-amber-100 text-amber-700" />}
                  </div>
                </section>
              )}

              {/* Facilities */}
              {college.facilities && Object.keys(college.facilities).length > 0 && (
                <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Campus Facilities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(college.facilities).map(([key, val]) => {
                      const Icon = FACILITY_ICONS[key.toLowerCase()] ?? CheckCircle2
                      const available = !!val
                      return (
                        <div key={key} className={`flex items-center gap-3 rounded-xl p-3.5 border ${available ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <Icon className={`w-4 h-4 shrink-0 ${available ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <div>
                            <div className={`text-xs font-semibold capitalize ${available ? 'text-emerald-800' : 'text-slate-500'}`}>{key.replace(/_/g, ' ')}</div>
                            <div className={`text-[10px] font-bold ${available ? 'text-emerald-600' : 'text-slate-400'}`}>{available ? '✓ Available' : '—'}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Contact info */}
              {(college.contact_email || college.contact_phone || college.address) && (
                <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Contact & Location</h2>
                  <div className="space-y-3">
                    {college.address && (
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span>{college.address}</span>
                      </div>
                    )}
                    {college.contact_phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${college.contact_phone}`} className="hover:text-blue-600 transition-colors">{college.contact_phone}</a>
                      </div>
                    )}
                    {college.contact_email && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`mailto:${college.contact_email}`} className="hover:text-blue-600 transition-colors">{college.contact_email}</a>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Anti-ragging notice */}
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-800 text-sm mb-1">Anti-Ragging Notice</div>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Ragging is strictly prohibited under UGC Anti-Ragging Regulations 2009. National helpline:{' '}
                      <a href="tel:18001805522" className="font-bold">1800-180-5522</a> (toll-free, 24×7) ·{' '}
                      <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" className="underline">antiragging.in</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQ for AEO */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    {
                      q: `How can I apply to ${college.name}?`,
                      a: `You can apply to ${college.name} for free through GyanSanchaar. Register, fill your profile once, choose a course, and submit — the entire process takes under 10 minutes. No agent fees, no commission.`,
                    },
                    {
                      q: `What courses does ${college.name} offer?`,
                      a: courses.length
                        ? `${college.name} currently offers ${courses.length} programmes: ${courses.slice(0, 5).map((c: any) => c.name).join(', ')}${courses.length > 5 ? ', and more' : ''}.`
                        : `${college.name} offers multiple undergraduate and postgraduate programmes. Check the Courses tab for the full list.`,
                    },
                    {
                      q: `Is ${college.name} a good college?`,
                      a: [
                        college.nirf_rank ? `It holds NIRF Rank #${college.nirf_rank}.` : '',
                        college.naac_grade ? `NAAC has graded it ${college.naac_grade}.` : '',
                        college.ugc_verified ? 'It is UGC recognised.' : '',
                        pd.rate ? `The placement rate is ${pd.rate}%.` : '',
                      ].filter(Boolean).join(' ') || `${college.name} is a recognised institution. Check official rankings and visit the campus before deciding.`,
                    },
                    {
                      q: `What is the fee structure at ${college.name}?`,
                      a: courses.length
                        ? `Annual fees at ${college.name} vary by programme. Check the Courses & Fees tab for course-wise fee details. Fees shown are indicative and may change — verify with the college directly.`
                        : `Fee information for ${college.name} is not yet listed. Contact the admissions office for the latest fee structure.`,
                    },
                  ].map(({ q, a }) => (
                    <details key={q} className="group border border-slate-200 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-slate-800 hover:bg-slate-50 list-none">
                        {q}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-2" />
                      </summary>
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── COURSES & FEES ──────────────────────────────────────── */}
          {activeTab === 'Courses & Fees' && (
            <>
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Courses Offered at {college.name}</h2>
                <p className="text-sm text-slate-500 mb-6">
                  {courses.length
                    ? `${courses.length} programmes available for {year}–${year + 1} admissions. Click "Apply Free" to apply to any course at no cost.`
                    : 'Course information not yet available.'}
                </p>

                {courses.length === 0
                  ? <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">No course data available yet.</div>
                  : <div className="space-y-3">
                    {courses.map((c: any) => {
                      const fee = c.pivot?.fee ?? c.default_fee ?? 0
                      const yrs = Math.ceil((c.duration_months ?? 24) / 12)
                      return (
                        <div key={c.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm mb-1.5">{c.name}</div>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{c.level}</span>
                                {c.duration_months && <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">{yrs} yr{yrs > 1 ? 's' : ''}</span>}
                                {fee > 0 && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">₹{fmt(fee)}/yr</span>}
                                {c.pivot?.branches && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{c.pivot.branches}</span>}
                              </div>
                              {c.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{c.description}</p>}
                            </div>
                            <CourseApplyButton college={college} course={c} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              </section>

              {/* Fee table */}
              {courses.some((c: any) => c.pivot?.fee || c.default_fee) && (
                <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Fee Structure</h2>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Programme</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Level</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Fee</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courses.map((c: any) => {
                          const fee = c.pivot?.fee ?? c.default_fee ?? 0
                          const yrs = Math.ceil((c.duration_months ?? 24) / 12)
                          return (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{c.name}</div>
                                {c.pivot?.branches && <div className="text-xs text-slate-400 mt-0.5">{c.pivot.branches}</div>}
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{c.level}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{yrs} yr{yrs > 1 ? 's' : ''}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{fee ? `₹${fmt(fee)}` : '—'}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">{fee ? `₹${fmt(fee * yrs)}` : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {college.fee_notes && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">Additional Information</div>
                      {college.fee_notes.trim().startsWith('<')
                        ? <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: college.fee_notes }} />
                        : <p className="text-sm text-slate-600 leading-relaxed">{college.fee_notes}</p>}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3">* Fees shown are indicative. Verify directly with the college before applying. Scholarship and category discounts may apply.</p>
                </section>
              )}
            </>
          )}

          {/* ── PLACEMENTS ──────────────────────────────────────────── */}
          {activeTab === 'Placements' && (
            <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Placement Record</h2>
              <p className="text-sm text-slate-500 mb-6">Data sourced from the college and verified against official disclosures where possible.</p>

              {Object.keys(pd).length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {pd.rate != null && <Stat label="Placement Rate" value={`${pd.rate}%`} sub={pd.year ? `Class of ${pd.year}` : undefined} color="bg-indigo-50 border border-indigo-100 text-indigo-700" />}
                    {pd.avg_package != null && <Stat label="Average Package" value={`₹${pd.avg_package}L`} sub="per annum" color="bg-emerald-50 border border-emerald-100 text-emerald-700" />}
                    {pd.highest_package != null && <Stat label="Highest Package" value={`₹${pd.highest_package}L`} sub="per annum" color="bg-amber-50 border border-amber-100 text-amber-700" />}
                  </div>

                  {pd.top_recruiters && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Top Recruiters
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pd.top_recruiters.split(',').map((r: string) => (
                          <span key={r.trim()} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-full font-medium border border-slate-200">
                            {r.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pd.notes && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-600 leading-relaxed italic">{pd.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-600 text-sm mb-1">Placement data not yet available</p>
                  <p className="text-slate-400 text-xs">Contact the college admissions office for the latest placement report.</p>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-6 bg-slate-50 rounded-xl p-3 border border-slate-200">
                GyanSanchaar does not guarantee placement outcomes. Verify placement statistics directly with the institution.
              </p>
            </section>
          )}

          {/* ── HOSTEL ─────────────────────────────────────────────── */}
          {activeTab === 'Hostel' && (
            <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hostel & Accommodation</h2>
              <p className="text-sm text-slate-500 mb-6">On-campus accommodation details for {college.name}.</p>

              {Object.keys(hi).length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Boys Hostel',    val: hi.boys_hostel,    icon: Home },
                      { label: 'Girls Hostel',   val: hi.girls_hostel,   icon: Home },
                      { label: 'Mess / Canteen', val: hi.mess_available, icon: Users },
                      { label: 'AC Rooms',       val: hi.ac_rooms,       icon: Star },
                    ].map(({ label, val, icon: Icon }) => (
                      <div key={label} className={`rounded-xl p-4 border text-center ${val ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${val ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <div className={`text-xs font-semibold ${val ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</div>
                        <div className={`text-[10px] font-bold mt-1 ${val ? 'text-emerald-600' : 'text-slate-400'}`}>{val ? '✓ Available' : '—'}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {hi.capacity != null && (
                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">{fmt(Number(hi.capacity))} beds</div>
                        </div>
                      </div>
                    )}
                    {hi.fee_per_year != null && (
                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <IndianRupee className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Fee</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">₹{fmt(Number(hi.fee_per_year))}/yr</div>
                        </div>
                      </div>
                    )}
                    {hi.curfew && (
                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curfew</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">{hi.curfew}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {hi.notes && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-800 leading-relaxed">{hi.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                  <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-600 text-sm mb-1">Hostel information not yet available</p>
                  <p className="text-slate-400 text-xs">Contact the college for accommodation details and current availability.</p>
                </div>
              )}
            </section>
          )}

          {/* ── GALLERY ─────────────────────────────────────────────── */}
          {activeTab === 'Gallery' && (
            <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Campus Gallery</h2>
              {(() => {
                const items: { type: 'image' | 'video'; url: string }[] = []
                if (college.campus_video_url) items.push({ type: 'video', url: college.campus_video_url })
                if (Array.isArray(college.gallery)) college.gallery.forEach((url: string) => items.push({ type: 'image', url }))
                if (items.length === 0) return (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
                    <div className="text-5xl mb-4">🏛️</div>
                    <div className="font-semibold text-slate-600 mb-1">Campus gallery coming soon</div>
                    <div className="text-slate-400 text-sm">Photos and video will appear here once uploaded.</div>
                  </div>
                )
                return <GalleryCarousel items={items} collegeName={college.name} />
              })()}
            </section>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">

            {/* Apply CTA */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/30">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-blue-300" />
                <span className="font-bold text-lg">Apply to {college.short_name ?? college.name}</span>
              </div>
              <p className="text-blue-200 text-xs mb-5">Use your saved profile. No refilling forms.</p>
              <ApplyCTA college={college} />
              <div className="flex items-center gap-1.5 text-blue-300 text-xs justify-center mt-4">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Free · No agent fees · Direct admission
              </div>
            </div>

            {/* Counsellor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Talk to a Counsellor</div>
                  <div className="text-slate-400 text-xs">Free · Unbiased · 30 min</div>
                </div>
              </div>
              <Link href="/dashboard/counselling" className="block border-2 border-blue-600 text-blue-600 font-semibold text-sm text-center py-2.5 rounded-xl hover:bg-blue-50 transition-colors w-full">
                Book Free Session
              </Link>
            </div>

            {/* Quick stats sidebar */}
            {(college.nirf_rank || college.naac_grade || college.google_rating) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rankings & Ratings</div>
                {college.nirf_rank && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-blue-500" />NIRF Rank</span>
                    <span className="font-bold text-slate-900 text-sm">#{college.nirf_rank}</span>
                  </div>
                )}
                {college.naac_grade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-500" />NAAC Grade</span>
                    <span className="font-bold text-slate-900 text-sm">{college.naac_grade}</span>
                  </div>
                )}
                {college.google_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" />Google Rating</span>
                    <span className="font-bold text-slate-900 text-sm">{college.google_rating} / 5</span>
                  </div>
                )}
              </div>
            )}

            {/* Trust badges */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Why Apply via GyanSanchaar?</div>
              <div className="space-y-2">
                {['Completely free — always', 'UGC-recognised colleges only', 'DPDP Act 2023 compliant', 'One profile, unlimited applications', 'WhatsApp + email status updates'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
