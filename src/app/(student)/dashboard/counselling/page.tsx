import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CounsellingPage() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await sb.from('bookings').select(`
    id, date, start_time, end_time, status, meeting_link,
    counsellors(id, name, slug, photo_url)
  `).eq('user_id', user.id).is('deleted_at', null).order('date', { ascending: false })

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-heading">Counselling Sessions</h1>
            <p className="text-muted text-sm mt-0.5">Free sessions with verified counsellors</p>
          </div>
        </div>

        {(bookings ?? []).length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <MessageCircle className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No bookings yet</p>
            <p className="text-muted text-xs mt-1">Book a session to get personalised guidance</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings!.map((b: any) => (
              <div key={b.id} className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-heading text-sm">{b.counsellors?.name}</div>
                    <div className="text-muted text-xs mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} · {b.start_time}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full uppercase">
                    {b.status}
                  </span>
                </div>
                {b.meeting_link && (
                  <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold mt-2">
                    <MessageCircle className="w-3.5 h-3.5" /> Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
