'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import { toast } from 'sonner'
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'

const BLANK = { role_type: 'team', name: '', title: '', bio: '', linkedin_url: '', twitter_url: '', email: '', photo_url: '', sort_order: 0, is_active: true }

export default function AdminTeam() {
  const sb = createBrowserSupabaseClient()
  const [members,  setMembers]  = useState<any[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [saving,   setSaving]   = useState<number | null>(null)
  const [adding,   setAdding]   = useState(false)
  const [newForm,  setNewForm]  = useState<any>({ ...BLANK })

  useEffect(() => {
    sb.from('team_members').select('*').order('sort_order').then(({ data }) => setMembers(data ?? []))
  }, [])

  async function saveMember(m: any) {
    setSaving(m.id)
    const { error } = await sb.from('team_members').update({ ...m, updated_at: new Date().toISOString() }).eq('id', m.id)
    if (error) toast.error(error.message)
    else toast.success('Saved!')
    setSaving(null)
  }

  async function addMember() {
    if (!newForm.name || !newForm.title) { toast.error('Name and title required'); return }
    const { data, error } = await sb.from('team_members').insert(newForm).select().single()
    if (error) { toast.error(error.message); return }
    setMembers(p => [...p, data])
    setNewForm({ ...BLANK })
    setAdding(false)
    toast.success('Member added!')
  }

  async function deleteMember(id: number, name: string) {
    if (!confirm(`Remove ${name}?`)) return
    await sb.from('team_members').delete().eq('id', id)
    setMembers(p => p.filter(m => m.id !== id))
    toast.success('Removed')
  }

  function updateField(id: number, key: string, val: any) {
    setMembers(p => p.map(m => m.id === id ? { ...m, [key]: val } : m))
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'
  const lbl = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  const MemberFields = ({ form, onChange }: { form: any; onChange: (k: string, v: any) => void }) => (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="col-span-2"><label className={lbl}>Role Type</label>
        <select value={form.role_type} onChange={e => onChange('role_type', e.target.value)} className={inp}>
          <option value="founder">Founder</option>
          <option value="mentor">Mentor / Advisor</option>
          <option value="team">Team</option>
        </select>
      </div>
      <div><label className={lbl}>Name *</label><input value={form.name} onChange={e => onChange('name', e.target.value)} className={inp} /></div>
      <div><label className={lbl}>Title *</label><input value={form.title} onChange={e => onChange('title', e.target.value)} className={inp} placeholder="Co-Founder & CEO" /></div>
      <div className="col-span-2"><label className={lbl}>Bio</label><textarea value={form.bio} onChange={e => onChange('bio', e.target.value)} rows={3} className={inp+' resize-none'} /></div>
      <div><label className={lbl}>LinkedIn URL</label><input type="url" value={form.linkedin_url ?? ''} onChange={e => onChange('linkedin_url', e.target.value)} className={inp} /></div>
      <div><label className={lbl}>Email</label><input type="email" value={form.email ?? ''} onChange={e => onChange('email', e.target.value)} className={inp} /></div>
      <div><label className={lbl}>Sort Order</label><input type="number" value={form.sort_order ?? 0} onChange={e => onChange('sort_order', Number(e.target.value))} className={inp} /></div>
      <div><label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer pt-5">
        <input type="checkbox" checked={form.is_active} onChange={e => onChange('is_active', e.target.checked)} className="rounded" />
        Active
      </label></div>
      <div className="col-span-2">
        <CloudinaryUpload label="Photo" value={form.photo_url ?? ''} onChange={v => onChange('photo_url', v)} folder="team" aspect="square" hint="Square photo preferred" />
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-white">Team</h1><p className="text-white/30 text-sm mt-0.5">Founders, mentors and team members</p></div>
        <button onClick={() => setAdding(!adding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add Member
        </button>
      </div>

      {/* Add new */}
      {adding && (
        <div className="bg-white/3 border border-blue-500/30 rounded-2xl p-5 mb-4">
          <div className="text-sm font-semibold text-blue-400 mb-1">New Member</div>
          <MemberFields form={newForm} onChange={(k,v) => setNewForm((p: any) => ({...p,[k]:v}))} />
          <div className="flex gap-3 mt-4">
            <button onClick={addMember} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <Save className="w-4 h-4" />Add
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-white/40 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-3">
                {m.photo_url && <img src={m.photo_url} alt="" className="w-8 h-8 rounded-full object-cover bg-white/10" />}
                <div>
                  <div className="font-semibold text-white text-sm">{m.name}</div>
                  <div className="text-white/40 text-xs">{m.title} · <span className="capitalize">{m.role_type}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${m.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {m.is_active ? 'Active' : 'Hidden'}
                </span>
                {expanded === m.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </div>
            </button>

            {expanded === m.id && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4">
                <MemberFields form={m} onChange={(k,v) => updateField(m.id, k, v)} />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => saveMember(m)} disabled={saving === m.id}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" />{saving === m.id ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => deleteMember(m.id, m.name)}
                    className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 px-3 py-2 rounded-xl text-sm transition-all">
                    <Trash2 className="w-4 h-4" />Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
