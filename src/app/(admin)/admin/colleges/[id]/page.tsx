import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CollegeForm from '@/components/admin/CollegeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCollegePage({ params }: { params: { id: string } }) {
  const sb  = await createServerSupabaseClient()
  const isNew = params.id === 'new'

  const [statesRes, streamsRes, coursesRes] = await Promise.all([
    sb.from('states').select('id,name').eq('is_active', true).order('name'),
    sb.from('streams').select('id,name').eq('is_active', true).order('sort_order'),
    sb.from('courses').select('id,name,level,duration_months,default_fee').eq('is_active', true).order('name'),
  ])

  let college: any = null
  let linkedCourses: any[] = []
  let linkedStreams: number[] = []

  if (!isNew) {
    const { data } = await sb.from('colleges').select('*').eq('id', Number(params.id)).is('deleted_at', null).single()
    if (!data) notFound()
    college = data

    const { data: cc } = await sb.from('college_course').select('*').eq('college_id', college.id)
    const { data: cs } = await sb.from('college_stream').select('stream_id').eq('college_id', college.id)
    linkedCourses = cc ?? []
    linkedStreams  = (cs ?? []).map((r: any) => r.stream_id)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/colleges" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{isNew ? 'Add College' : college.name}</h1>
          <p className="text-white/30 text-sm mt-0.5">{isNew ? 'Create a new college listing' : 'Edit college details'}</p>
        </div>
      </div>

      <CollegeForm
        college={college}
        states={statesRes.data ?? []}
        streams={streamsRes.data ?? []}
        allCourses={coursesRes.data ?? []}
        linkedCourses={linkedCourses}
        linkedStreams={linkedStreams}
      />
    </div>
  )
}
