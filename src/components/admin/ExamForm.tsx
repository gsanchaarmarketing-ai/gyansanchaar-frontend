'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, Trash2 } from 'lucide-react'

export default function ExamForm({ exam, streams, linkedStreams }: { exam: any; streams: any[]; linkedStreams: number[] }) {
  const router = useRouter()
  const sb     = createBrowserSupabaseClient()
  const isNew  = !exam?.id
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name:               exam?.name               ?? '',
    slug:               exam?.slug               ?? '',
    short_name:         exam?.short_name         ?? '',
    level:              exam?.level              ?? 'national',
    conducting_body:    exam?.conducting_body    ?? '',
    description:        exam?.description        ?? '',
    eligibility:        exam?.eligibility        ?? '',
    exam_pattern:       exam?.exam_pattern       ?? '',
    registration_start: exam?.registration_start ?? '',
    registration_end:   exam?.registration_end   ?? '',
    exam_date:          exam?.exam_date          ?? '',
    result_date:        exam?.result_date        ?? '',
    official_website:   exam?.official_website   ?? '',
    is_active:          exam?.is_active          ?? true,
  })
  const [selStreams, setSelStreams] = useState<number[]>(linkedStreams)

  function f(k: string) {
    return (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function save() {
    if (!form.name) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const payload: any = {
        name: form.name, slug,
        short_name: form.short_name || null,
        level: form.level,
        conducting_body: form.conducting_body || null,
        description: form.description || null,
        eligibility: form.eligibility || null,
        exam_pattern: form.exam_pattern || null,
        registration_start: form.registration_start || null,
        registration_end: form.registration_end || null,
        exam_date: form.exam_date || null,
        result_date: form.result_date || null,
        official_website: form.official_website || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      let examId = exam?.id
      if (isNew) {
        const { data, error } = await sb.from('exams').insert(payload).select('id').single()
        if (error) throw error
        examId = data.id
      } else {
        const { error } = await sb.from('exams').update(payload).eq('id', exam.id)
        if (error) throw error
      }

      // Sync exam_stream
      await sb.from('exam_stream').delete().eq('exam_id', examId)
      if (selStreams.length) {
        await sb.from('exam_stream').insert(selStreams.map(sid => ({ exam_id: examId, stream_id: sid })))
      }

      toast.success(isNew ? 'Exam created!' : 'Saved!')
      if (isNew) router.push(`/admin/exams/${examId}`)
      else router.refresh()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function deleteExam() {
    if (!confirm(`Delete ${exam.name}?`)) return
    await sb.from('exams').delete().eq('id', exam.id)
    toast.success('Deleted')
    router.push('/admin/exams')
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'
  const lbl = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className={lbl}>Full Name *</label><input value={form.name} onChange={f('name')} className={inp} placeholder="Joint Entrance Examination Main" /></div>
        <div><label className={lbl}>Short Name</label><input value={form.short_name} onChange={f('short_name')} className={inp} placeholder="JEE Main" /></div>
        <div><label className={lbl}>Slug</label><input value={form.slug} onChange={f('slug')} className={inp} placeholder="jee-main" /></div>
        <div><label className={lbl}>Level *</label>
          <select value={form.level} onChange={f('level')} className={inp}>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="university">University</option>
          </select>
        </div>
        <div><label className={lbl}>Conducting Body</label><input value={form.conducting_body} onChange={f('conducting_body')} className={inp} placeholder="National Testing Agency" /></div>
        <div className="col-span-2"><label className={lbl}>Description</label><textarea value={form.description} onChange={f('description')} rows={3} className={inp+' resize-none'} /></div>
        <div className="col-span-2"><label className={lbl}>Eligibility</label><textarea value={form.eligibility} onChange={f('eligibility')} rows={3} className={inp+' resize-none'} /></div>
        <div className="col-span-2"><label className={lbl}>Exam Pattern</label><textarea value={form.exam_pattern} onChange={f('exam_pattern')} rows={3} className={inp+' resize-none'} /></div>

        <div><label className={lbl}>Registration Opens</label><input type="date" value={form.registration_start} onChange={f('registration_start')} className={inp} /></div>
        <div><label className={lbl}>Registration Closes</label><input type="date" value={form.registration_end} onChange={f('registration_end')} className={inp} /></div>
        <div><label className={lbl}>Exam Date</label><input type="date" value={form.exam_date} onChange={f('exam_date')} className={inp} /></div>
        <div><label className={lbl}>Result Date</label><input type="date" value={form.result_date} onChange={f('result_date')} className={inp} /></div>

        <div className="col-span-2"><label className={lbl}>Official Website</label><input type="url" value={form.official_website} onChange={f('official_website')} className={inp} placeholder="https://jeemain.nta.nic.in" /></div>

        <div className="col-span-2"><label className={lbl}>Linked Streams</label>
          <div className="flex flex-wrap gap-2">
            {streams.map(s => (
              <button key={s.id} type="button"
                onClick={() => setSelStreams(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selStreams.includes(s.id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer pt-2">
        <input type="checkbox" checked={form.is_active} onChange={f('is_active')} className="rounded" />
        Active (visible on website)
      </label>

      <div className="flex items-center gap-3 pt-6 border-t border-white/8">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? 'Saving…' : isNew ? 'Create Exam' : 'Save Changes'}
        </button>
        {!isNew && (
          <button onClick={deleteExam}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl text-sm transition-all">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        )}
      </div>
    </div>
  )
}
