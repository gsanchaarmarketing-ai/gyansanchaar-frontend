import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getExamBySlug } from '@/lib/supabase-api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, ExternalLink, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const exam = await getExamBySlug(params.slug)
    const desc = `${exam.name} ${new Date().getFullYear()} — eligibility, exam dates, pattern and preparation tips.`
    return {
      title: `${exam.name} ${new Date().getFullYear()} — Dates, Eligibility, Pattern | GyanSanchaar`,
      description: desc,
      alternates: { canonical: `/exams/${exam.slug}` },
      openGraph: { title: exam.name, description: desc },
    }
  } catch {
    return { title: 'Exam Details | GyanSanchaar' }
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ExamDetailPage({ params }: Props) {
  let exam: any = null

  try {
    const r = { data: await getExamBySlug(params.slug) }
    exam = r.data
  } catch (err) {
    notFound()
    throw err
  }

  if (!exam) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: exam.name,
    description: exam.description ?? `${exam.name} entrance examination`,
    organizer: { '@type': 'Organization', name: exam.conducting_body ?? 'Government of India' },
    ...(exam.exam_date ? { startDate: exam.exam_date } : {}),
    ...(exam.official_website ? { url: exam.official_website } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="text-xs text-muted mb-4">
          <Link href="/exams" className="hover:text-primary">← All Exams</Link>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-8 mb-6">
          <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            {exam.level}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{exam.name}</h1>
          {exam.conducting_body && (
            <p className="text-white/70 text-sm mb-3">Conducted by {exam.conducting_body}</p>
          )}
          {exam.streams && exam.streams.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exam.streams.map((s: any) => (
                <span key={s.id} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{s.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Important Dates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Registration Opens', value: fmtDate(exam.registration_start) },
            { label: 'Registration Closes', value: fmtDate(exam.registration_end) },
            { label: 'Exam Date', value: fmtDate(exam.exam_date) },
            { label: 'Result Date', value: fmtDate(exam.result_date) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                <Calendar className="w-3 h-3" />{label}
              </div>
              <div className="font-bold text-heading text-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {exam.description && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> About {exam.short_name ?? exam.name}
              </h2>
              <p className="text-body text-sm leading-relaxed">{exam.description}</p>
            </section>
          )}

          {exam.eligibility && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Eligibility
              </h2>
              <p className="text-body text-sm leading-relaxed whitespace-pre-line">{exam.eligibility}</p>
            </section>
          )}

          {exam.exam_pattern && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3">Exam Pattern</h2>
              <p className="text-body text-sm leading-relaxed whitespace-pre-line">{exam.exam_pattern}</p>
            </section>
          )}

          {exam.official_website && (
            <section className="bg-primary-light border border-border rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-heading mb-2">Official Resources</h2>
                <p className="text-body text-sm mb-4">Always verify exam dates and details from the official source before applying.</p>
              </div>
              <a href={exam.official_website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold w-fit">
                <ExternalLink className="w-4 h-4" /> Official Website
              </a>
            </section>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl p-6 text-white text-center">
          <p className="text-sm mb-3 text-white/80">Find colleges accepting {exam.short_name ?? exam.name} scores</p>
          <Link href={`/colleges?exam=${exam.slug}`}
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-2.5 rounded-xl text-sm">
            Browse Colleges <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
