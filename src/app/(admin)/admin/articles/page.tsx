import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AdminArticles({ searchParams }: { searchParams: { q?: string } }) {
  const sb = await createServerSupabaseClient()
  let q = sb.from('articles').select('id,title,slug,category,status,published_at,views').order('created_at', { ascending: false }).is('deleted_at', null)
  if (searchParams.q) q = q.ilike('title', `%${searchParams.q}%`)
  const { data: articles } = await q

  const STATUS_COLOR: Record<string, string> = {
    published: 'bg-emerald-500/15 text-emerald-400',
    draft:     'bg-amber-500/15 text-amber-400',
    archived:  'bg-white/5 text-white/25',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-white">Articles</h1><p className="text-white/30 text-sm mt-0.5">{articles?.length ?? 0} total</p></div>
        <Link href="/admin/articles/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />New Article
        </Link>
      </div>
      <form className="mb-5"><input name="q" defaultValue={searchParams.q} placeholder="Search articles…" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 w-72 transition-colors" /></form>
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">{['Title','Category','Status','Views','Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {articles?.map(a => (
              <tr key={a.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-5 py-3.5 font-medium text-white/90 max-w-xs truncate">{a.title}</td>
                <td className="px-5 py-3.5 text-white/40 text-xs capitalize">{a.category?.replace(/_/g,' ')}</td>
                <td className="px-5 py-3.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? ''}`}>{a.status}</span></td>
                <td className="px-5 py-3.5 text-white/30 text-xs">{a.views?.toLocaleString() ?? 0}</td>
                <td className="px-5 py-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/articles/${a.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white inline-flex transition-all"><Pencil className="w-3.5 h-3.5" /></Link>
                </td>
              </tr>
            ))}
            {!articles?.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/20 text-sm">No articles found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
