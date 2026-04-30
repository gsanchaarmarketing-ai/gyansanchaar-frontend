import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ArticleEditor from '@/components/admin/ArticleEditor'
export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const sb = await createServerSupabaseClient()
  if (params.id === 'new') return <ArticleEditor />
  const { data } = await sb.from('articles').select('*').eq('id', Number(params.id)).single()
  if (!data) notFound()
  return <ArticleEditor article={data} />
}
