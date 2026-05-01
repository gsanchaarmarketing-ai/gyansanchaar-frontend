import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ExamForm from '@/components/admin/ExamForm'

export const dynamic = 'force-dynamic'

export default async function AdminExamPage({ params }: { params: { id: string } }) {
  const sb    = await createServerSupabaseClient()
  const isNew = params.id === 'new'

  const { data: streams } = await sb.from('streams').select('id,name').eq('is_active', true).order('sort_order')

  let exam: any = null
  let linkedStreams: number[] = []
  if (!isNew) {
    const { data } = await sb.from('exams').select('*').eq('id', Number(params.id)).single()
    if (!data) notFound()
    exam = data
    const { data: es } = await sb.from('exam_stream').select('stream_id').eq('exam_id', exam.id)
    linkedStreams = (es ?? []).map((r: any) => r.stream_id)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/exams" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{isNew ? 'Add Exam' : exam.name}</h1>
          <p className="text-white/30 text-sm mt-0.5">{isNew ? 'Create a new entrance exam' : 'Edit exam details'}</p>
        </div>
      </div>
      <ExamForm exam={exam} streams={streams ?? []} linkedStreams={linkedStreams} />
    </div>
  )
}
