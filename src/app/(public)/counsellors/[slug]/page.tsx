import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { Star, Clock, BadgeCheck, MessageCircle, Shield, GraduationCap } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }
export const revalidate = 3600

async function getCounsellor(slug: string) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb.from('counsellors').select('*').eq('slug', slug).eq('is_active', true).single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCounsellor(params.slug)
  if (!c) return { title: 'Counsellor Not Found' }
  return {
    title: `${c.name} — Free College Counselling | GyanSanchaar`,
    description: `Book a free session with ${c.name}. ${c.experience_years ?? ''} years experience. Verified counsellor.`,
  }
}

export default async function CounsellorPage({ params }: Props) {
  const counsellor = await getCounsellor(params.slug)
  if (!counsellor) notFound()

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
              {counsellor.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-heading">{counsellor.name}</h1>
              <p className="text-body text-sm mt-1">{counsellor.current_organisation}</p>
              <p className="text-muted text-xs mt-0.5">{counsellor.qualification}</p>
            </div>
          </div>
          {counsellor.bio && <p className="text-body text-sm mt-4 leading-relaxed">{counsellor.bio}</p>}
        </div>
        <Link href="/dashboard/counselling"
          className="block text-center bg-primary text-white font-bold py-3 rounded-2xl">
          Book a Free Session
        </Link>
      </main>
      <MobileNav />
    </>
  )
}
