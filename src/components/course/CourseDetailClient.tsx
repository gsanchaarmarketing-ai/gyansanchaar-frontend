'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock, IndianRupee, BookOpen, ArrowLeft,
  CheckCircle2, Briefcase, TrendingUp, Building2,
  GraduationCap, MapPin, BadgeCheck, ChevronRight,
} from 'lucide-react'

const TABS = [
  { key: 'overview',  label: 'Overview'   },
  { key: 'syllabus',  label: 'Syllabus'   },
  { key: 'jobs',      label: 'Jobs'       },
  { key: 'salary',    label: 'Salary'     },
  { key: 'colleges',  label: 'Top Colleges' },
] as const
type TabKey = typeof TABS[number]['key']

function feeRange(course: any): string {
  if (course.fee_min && course.fee_max) {
    const min = course.fee_min >= 100000
      ? `${(course.fee_min / 100000).toFixed(1)}L`
      : `${Math.round(course.fee_min / 1000)}K`
    const max = course.fee_max >= 100000
      ? `${(course.fee_max / 100000).toFixed(1)}L`
      : `${Math.round(course.fee_max / 1000)}K`
    return `${min}–${max} INR`
  }
  if (course.default_fee) {
    return course.default_fee >= 100000
      ? `${(course.default_fee / 100000).toFixed(1)}L INR`
      : `${Math.round(course.default_fee / 1000)}K INR`
  }
  return 'Varies'
}

function TextContent({ text }: { text: string }) {
  // If content is HTML (from Quill editor), render it directly
  if (text.trim().startsWith('<')) {
    return (
      <div
        className="prose prose-sm max-w-none text-body leading-relaxed
          prose-headings:text-heading prose-headings:font-bold
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-a:text-primary prose-a:underline
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-body prose-strong:text-heading"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }
  // Plain text fallback with bullet detection
  const paragraphs = text.split(/\n{2,}/).filter(Boolean)
  return (
    <div className="space-y-4 text-body text-sm leading-relaxed">
      {paragraphs.map((p, i) => (
        p.trim().startsWith('-') || p.trim().startsWith('•') ? (
          <ul key={i} className="space-y-1.5 ml-1">
            {p.split('\n').filter(Boolean).map((line, j) => (
              <li key={j} className="flex items-start gap-2">
                <span className="text-primary mt-1 shrink-0">•</span>
                <span>{line.replace(/^[-•]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{p}</p>
        )
      ))}
    </div>
  )
}

export default function CourseDetailClient({ course }: { course: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const router = useRouter()

  const colleges = course.colleges ?? []
  const durationYrs = Math.ceil((course.duration_months ?? 24) / 12)

  // Decide which tabs have content to show
  const availableTabs = TABS.filter(t => {
    if (t.key === 'overview')  return true
    if (t.key === 'syllabus')  return !!course.syllabus
    if (t.key === 'jobs')      return !!course.scope_jobs
    if (t.key === 'salary')    return !!course.avg_salary
    if (t.key === 'colleges')  return colleges.length > 0 || !!course.top_colleges_text
    return false
  })

  return (
    <main className="bg-white min-h-screen pb-24 md:pb-0">

      {/* ── STICKY HEADER TABS ───────────────────────────────────────── */}
      <div className="sticky top-14 md:top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {availableTabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as TabKey)}
                className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-heading'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted mb-5">
          <Link href="/courses" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Courses
          </Link>
          <span>/</span>
          <span className="text-body truncate">{course.name}</span>
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-6">

              {/* Author-style byline + highlighted first para */}
              {course.overview_content && (() => {
                const paras = course.overview_content.split(/\n{2,}/).filter(Boolean)
                const first = paras[0]
                const rest  = paras.slice(1).join('\n\n')
                return (
                  <>
                    <blockquote className="border-l-4 border-amber-400 bg-amber-50/60 rounded-r-xl pl-4 pr-4 py-3">
                      <p className="text-body text-sm leading-relaxed italic">
                        <strong className="not-italic">{course.name} </strong>
                        {first.replace(course.name, '').replace(/^[,\s]+/, '')}
                      </p>
                    </blockquote>
                    {rest && (
                      <section>
                        <h2 className="text-lg font-bold text-heading mb-3">{course.name} Overview</h2>
                        <TextContent text={rest} />
                      </section>
                    )}
                  </>
                )
              })()}

              {!course.overview_content && course.description && (
                <blockquote className="border-l-4 border-amber-400 bg-amber-50/60 rounded-r-xl pl-4 pr-4 py-3">
                  <p className="text-body text-sm leading-relaxed italic">{course.description}</p>
                </blockquote>
              )}

              {/* Eligibility */}
              {course.eligibility && (
                <section>
                  <h2 className="text-base font-bold text-heading mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" /> Eligibility
                  </h2>
                  <TextContent text={course.eligibility} />
                </section>
              )}

              {/* Quick navigation to other tabs */}
              {availableTabs.filter(t => t.key !== 'overview').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                  {availableTabs.filter(t => t.key !== 'overview').map(t => {
                    const icons: Record<string, any> = {
                      syllabus: BookOpen, jobs: Briefcase,
                      salary: TrendingUp, colleges: Building2,
                    }
                    const Icon = icons[t.key] ?? ChevronRight
                    return (
                      <button key={t.key} onClick={() => setActiveTab(t.key as TabKey)}
                        className="flex items-center gap-2 p-3 border border-border rounded-xl text-sm font-medium text-body hover:border-primary hover:text-primary hover:bg-primary-light transition-all text-left">
                        <Icon className="w-4 h-4 shrink-0" />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Course image */}
              {course.overview_image && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-primary-light">
                  <img src={course.overview_image} alt={course.name}
                       className="w-full h-full object-cover" />
                </div>
              )}

              {/* Quick stats card */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] p-4">
                  <div className="inline-block bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase mb-2">
                    {course.level}
                  </div>
                  <h1 className="text-white font-bold text-lg leading-tight">{course.name}</h1>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted"><Clock className="w-4 h-4" />Duration</span>
                    <span className="font-semibold text-heading">{durationYrs} {durationYrs === 1 ? 'year' : 'years'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted"><IndianRupee className="w-4 h-4" />Avg Fees</span>
                    <span className="font-semibold text-heading">{feeRange(course)}</span>
                  </div>
                  {course.stream && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted"><BookOpen className="w-4 h-4" />Stream</span>
                      <span className="font-semibold text-heading">{course.stream.name}</span>
                    </div>
                  )}
                  {colleges.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted"><Building2 className="w-4 h-4" />Colleges</span>
                      <span className="font-semibold text-heading">{colleges.length}+</span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <Link href="/register"
                    className="block bg-primary hover:bg-primary-hover text-white text-center font-bold py-3 rounded-xl text-sm transition-colors w-full">
                    Apply to Colleges Free →
                  </Link>
                  <p className="text-center text-xs text-muted mt-2">No fees · Direct admission</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SYLLABUS TAB ──────────────────────────────────────────── */}
        {activeTab === 'syllabus' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-xl font-bold text-heading">{course.name} — Syllabus</h2>
            {course.syllabus ? (
              <div className="bg-white border border-border rounded-2xl p-5">
                <TextContent text={course.syllabus} />
              </div>
            ) : (
              <EmptyTab message="Syllabus details coming soon." />
            )}
          </div>
        )}

        {/* ── JOBS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-xl font-bold text-heading">{course.name} — Career Scope & Jobs</h2>
            {course.scope_jobs ? (
              <div className="bg-white border border-border rounded-2xl p-5">
                <TextContent text={course.scope_jobs} />
              </div>
            ) : (
              <EmptyTab message="Job scope information coming soon." />
            )}
          </div>
        )}

        {/* ── SALARY TAB ────────────────────────────────────────────── */}
        {activeTab === 'salary' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-xl font-bold text-heading">{course.name} — Salary</h2>
            {course.avg_salary ? (
              <div className="bg-white border border-border rounded-2xl p-5">
                <TextContent text={course.avg_salary} />
              </div>
            ) : (
              <EmptyTab message="Salary data coming soon." />
            )}
          </div>
        )}

        {/* ── COLLEGES TAB ──────────────────────────────────────────── */}
        {activeTab === 'colleges' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-heading">Top Colleges for {course.name}</h2>

            {course.top_colleges_text && (
              <div className="bg-primary-light border border-primary/20 rounded-2xl p-5">
                <TextContent text={course.top_colleges_text} />
              </div>
            )}

            {colleges.length > 0 ? (
              <div className="space-y-3">
                {colleges.map((c: any) => (
                  <Link key={c.id} href={`/colleges/${c.slug}`}
                    className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 hover:border-primary hover:shadow-sm transition-all group">
                    {c.logo_path ? (
                      <img src={c.logo_path} alt={c.name}
                           className="w-12 h-12 rounded-xl object-contain border bg-white flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-heading text-sm">{c.name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted">
                        {c.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />{c.city}{c.state ? `, ${c.state.name}` : ''}
                          </span>
                        )}
                        {c.pivot?.fee && <span>· ₹{Number(c.pivot.fee).toLocaleString('en-IN')}/yr</span>}
                        {c.pivot?.seats && <span>· {c.pivot.seats} seats</span>}
                        {c.ugc_verified && (
                          <span className="flex items-center gap-0.5 text-blue-600">
                            <BadgeCheck className="w-3 h-3" /> UGC
                          </span>
                        )}
                      </div>
                      {c.pivot?.branches && (
                        <div className="text-xs text-muted mt-0.5">Branches: {c.pivot.branches}</div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              !course.top_colleges_text && <EmptyTab message="No colleges listed for this course yet." />
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="bg-slate-50 border border-border rounded-2xl p-12 text-center">
      <GraduationCap className="w-10 h-10 text-muted mx-auto mb-3" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}
