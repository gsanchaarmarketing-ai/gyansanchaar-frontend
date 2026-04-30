'use client'
import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminMedia() {
  const sb = createBrowserSupabaseClient()
  const [logos, setLogos] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', sort_order: '0' })

  useEffect(() => {
    sb.from('media_logos').select('*').order('sort_order').then(({ data }) => setLogos(data ?? []))
  }, [])

  async function add() {
    if (!form.name || !form.logo_url) { toast.error('Name and logo URL required'); return }
    const { data, error } = await sb.from('media_logos').insert({ ...form, sort_order: Number(form.sort_order), is_active: true }).select().single()
    if (error) { toast.error(error.message); return }
    setLogos(p => [...p, data])
    setForm({ name: '', logo_url: '', website_url: '', sort_order: '0' })
    toast.success('Added!')
  }

  async function toggle(id: number, current: boolean) {
    await sb.from('media_logos').update({ is_active: !current }).eq('id', id)
    setLogos(p => p.map(l => l.id === id ? { ...l, is_active: !current } : l))
  }

  async function remove(id: number) {
    if (!confirm('Remove this logo?')) return
    await sb.from('media_logos').delete().eq('id', id)
    setLogos(p => p.filter(l => l.id !== id))
    toast.success('Removed')
  }

  const inp = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6"><h1 className="text-2xl font-bold text-white">Media Logos</h1><p className="text-white/30 text-sm mt-0.5">Auto-scrolling "As seen in" strip on homepage</p></div>

      {/* Add form */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Add Media House</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className={inp} placeholder="e.g. The Hindu" />
          <input value={form.logo_url} onChange={e => setForm(p=>({...p,logo_url:e.target.value}))} className={inp} placeholder="Logo image URL" type="url" />
          <input value={form.website_url} onChange={e => setForm(p=>({...p,website_url:e.target.value}))} className={inp} placeholder="Website URL (optional)" type="url" />
          <input value={form.sort_order} onChange={e => setForm(p=>({...p,sort_order:e.target.value}))} className={inp} placeholder="Sort order (0, 1, 2…)" type="number" />
        </div>
        <button onClick={add} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" />Add Logo
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {logos.map(l => (
          <div key={l.id} className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
            <div className="w-24 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={l.logo_url} alt={l.name} className="max-h-8 max-w-full object-contain" onError={e => { (e.target as any).style.display='none' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{l.name}</div>
              <div className="text-[10px] text-white/25 truncate">{l.logo_url}</div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/25'}`}>{l.is_active ? 'Active' : 'Hidden'}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => toggle(l.id, l.is_active)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                {l.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!logos.length && <div className="text-center py-8 text-white/20 text-sm">No media logos yet</div>}
      </div>
    </div>
  )
}
