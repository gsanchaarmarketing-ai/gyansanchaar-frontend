import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CourseForm from '@/components/admin/CourseForm'

export const dynamic = 'force-dynamic'

export default async function AdminCoursePage({ params }: { params: { id: string } }) {
  const sb    = await createServerSupabaseClient()
  const isNew = params.id === 'new'

  const { data: streams } = await sb.from('streams').select('id,name').eq('is_active', true).order('sort_order')

  let course: any = null
  if (!isNew) {
    const { data } = await sb.from('courses').select('*').eq('id', Number(params.id)).single()
    if (!data) notFound()
    course = data
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{isNew ? 'Add Course' : course.name}</h1>
          <p className="text-white/30 text-sm mt-0.5">{isNew ? 'Create a new course' : 'Edit course details'}</p>
        </div>
      </div>
      <CourseForm course={course} streams={streams ?? []} />
    </div>
  )
}
