import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ApplicationManager from '@/components/admin/ApplicationManager'

export const dynamic = 'force-dynamic'

export default async function AdminApplicationPage({ params }: { params: { id: string } }) {
  const sb = await createServerSupabaseClient()

  const { data: app } = await sb.from('applications')
    .select(`
      *,
      profiles!applications_student_id_fkey(id, name, phone, dob, address, city, state_id, father_name, alt_phone, states(name)),
      colleges(id, name, slug, city, contact_email),
      courses(id, name, level, duration_months),
      application_status_histories(id, from_status, to_status, note, created_at, actor_id)
    `)
    .eq('id', Number(params.id))
    .single()

  if (!app) notFound()

  // Get student email
  const { createAdminSupabaseClient } = await import('@/lib/supabase')
  let studentEmail = ''
  try {
    const admin = createAdminSupabaseClient()
    const { data: { user } } = await admin.auth.admin.getUserById((app.profiles as any).id)
    studentEmail = user?.email ?? ''
  } catch {}

  // Get student documents
  const { data: docs } = await sb.from('documents')
    .select('id, type, path, original_filename, created_at')
    .eq('user_id', (app.profiles as any).id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/applications" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Application #{app.id}</h1>
          <p className="text-white/30 text-sm mt-0.5">
            {(app.profiles as any)?.name} → {(app.colleges as any)?.name}
          </p>
        </div>
      </div>

      <ApplicationManager
        application={app}
        studentEmail={studentEmail}
        documents={docs ?? []}
      />
    </div>
  )
}
