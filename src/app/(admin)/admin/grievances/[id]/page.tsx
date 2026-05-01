import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GrievanceResponder from '@/components/admin/GrievanceResponder'

export const dynamic = 'force-dynamic'

export default async function AdminGrievancePage({ params }: { params: { id: string } }) {
  const sb = await createServerSupabaseClient()

  const { data: grievance } = await sb.from('grievances')
    .select('*, grievance_responses(id, message, is_internal, sent_at, created_at, profiles(name,role))')
    .eq('id', Number(params.id))
    .single()

  if (!grievance) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/grievances" className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Grievance {grievance.ticket_id}</h1>
          <p className="text-white/30 text-sm mt-0.5">{grievance.complainant_name} · {grievance.category.replace(/_/g,' ')}</p>
        </div>
      </div>
      <GrievanceResponder grievance={grievance} />
    </div>
  )
}
