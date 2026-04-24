import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApi, type Exam } from '@/lib/api'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Calendar, ExternalLink, BookOpen, CheckCircle } from 'lucide-react'

interface Props { params: { slug: string } }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: exam } = await publicApi.exam(params.slug)
    const desc = `${exam.name} — eligibility, exam pattern, important dates, registration details and preparation tips.`
    return {
      title: `${exam.name} ${new Date().getFullYear()} — Dates, Eligibility, Pattern | GyanSanchaar`,
      description: desc,
      openGraph: { title: exam.name, description: desc },
      alternates: { canonical: `/exams/${exam.slug}` },
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
  let exam: Exam
  try {
    const r = await publicApi.exam(params.slug)
    exam = r.data
  } catch {
    notFound()
  }

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
            {exam.level?.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{exam.name}</h1>
          {exam.conducting_body && (
            <p className="text-white/70 text-sm">Conducted by {exam.conducting_body}</p>
          )}
          {exam.official_website && (
            <a href={exam.official_website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-white/80 text-sm hover:text-white">
              <ExternalLink className="w-3.5 h-3.5" /> Official website
            </a>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Registration opens', value: fmtDate(exam.registration_start) },
            { label: 'Registration closes', value: fmtDate(exam.registration_end) },
            { label: 'Exam date', value: fmtDate(exam.exam_date) },
            { label: 'Result date', value: fmtDate(exam.result_date) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1"><Calendar className="w-3 h-3" />{label}</div>
              <div className="font-bold text-heading text-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {exam.description && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> About {exam.name}</h2>
              <p className="text-body text-sm leading-relaxed">{exam.description}</p>
            </section>
          )}

          {exam.eligibility && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Eligibility</h2>
              <p className="text-body text-sm leading-relaxed whitespace-pre-line">{exam.eligibility}</p>
            </section>
          )}

          {exam.exam_pattern && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3">Exam Pattern</h2>
              <p className="text-body text-sm leading-relaxed whitespace-pre-line">{exam.exam_pattern}</p>
            </section>
          )}

          {exam.streams && exam.streams.length > 0 && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-heading mb-3">Applicable Streams</h2>
              <div className="flex flex-wrap gap-2">
                {exam.streams.map(s => (
                  <span key={s.id} className="bg-primary-light text-primary text-xs font-semibold px-3 py-1 rounded-full">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="mt-8 bg-primary-light border border-border rounded-2xl p-6 text-center">
          <p className="text-body text-sm mb-3">Preparing for {exam.short_name ?? exam.name}? Find colleges that accept this exam.</p>
          <Link href={`/colleges?exam=${exam.slug}`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
            Browse accepting colleges →
          </Link>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
