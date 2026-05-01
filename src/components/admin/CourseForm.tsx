'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import { toast } from 'sonner'
import { Save, Trash2 } from 'lucide-react'

export default function CourseForm({ course, streams }: { course: any; streams: any[] }) {
  const router = useRouter()
  const sb     = createBrowserSupabaseClient()
  const isNew  = !course?.id
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name:              course?.name              ?? '',
    slug:              course?.slug              ?? '',
    stream_id:         course?.stream_id         ?? '',
    level:             course?.level             ?? 'ug',
    duration_months:   course?.duration_months   ?? 36,
    description:       course?.description       ?? '',
    eligibility:       course?.eligibility       ?? '',
    default_fee:       course?.default_fee       ?? 0,
    fee_min:           course?.fee_min           ?? '',
    fee_max:           course?.fee_max           ?? '',
    overview_image:    course?.overview_image    ?? '',
    overview_content:  course?.overview_content  ?? '',
    syllabus:          course?.syllabus          ?? '',
    scope_jobs:        course?.scope_jobs        ?? '',
    avg_salary:        course?.avg_salary        ?? '',
    top_colleges_text: course?.top_colleges_text ?? '',
    is_active:         course?.is_active         ?? true,
  })

  function f(k: string) {
    return (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function save() {
    if (!form.name || !form.stream_id) { toast.error('Name and Stream required'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const payload: any = {
        name: form.name, slug,
        stream_id: Number(form.stream_id),
        level: form.level,
        duration_months: Number(form.duration_months),
        description: form.description || null,
        eligibility: form.eligibility || null,
        default_fee: Number(form.default_fee) || 0,
        fee_min: form.fee_min ? Number(form.fee_min) : null,
        fee_max: form.fee_max ? Number(form.fee_max) : null,
        overview_image: form.overview_image || null,
        overview_content: form.overview_content || null,
        syllabus: form.syllabus || null,
        scope_jobs: form.scope_jobs || null,
        avg_salary: form.avg_salary || null,
        top_colleges_text: form.top_colleges_text || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { data, error } = await sb.from('courses').insert(payload).select('id').single()
        if (error) throw error
        toast.success('Course created!')
        router.push(`/admin/courses/${data.id}`)
      } else {
        const { error } = await sb.from('courses').update(payload).eq('id', course.id)
        if (error) throw error
        toast.success('Saved!')
        router.refresh()
      }
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function deleteCourse() {
    if (!confirm(`Delete ${course.name}? This cannot be undone.`)) return
    await sb.from('courses').delete().eq('id', course.id)
    toast.success('Deleted')
    router.push('/admin/courses')
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'
  const lbl = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className={lbl}>Course Name *</label><input value={form.name} onChange={f('name')} className={inp} placeholder="B.Tech Computer Science" /></div>
        <div><label className={lbl}>Slug (auto if blank)</label><input value={form.slug} onChange={f('slug')} className={inp} placeholder="btech-cse" /></div>
        <div><label className={lbl}>Stream *</label>
          <select value={form.stream_id} onChange={f('stream_id')} className={inp}>
            <option value="">— Select stream —</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Level *</label>
          <select value={form.level} onChange={f('level')} className={inp}>
            {[['ug','Under Graduation'],['pg','Post Graduation'],['phd','PhD'],['diploma','Diploma'],['certificate','Certificate'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Duration (months) *</label><input type="number" value={form.duration_months} onChange={f('duration_months')} className={inp} /></div>

        <div className="col-span-2">
          <label className={lbl}>Eligibility</label>
          <input value={form.eligibility} onChange={f('eligibility')} className={inp} placeholder="10+2 with PCM min 45%, JEE Main" />
        </div>

        <div><label className={lbl}>Default Fee (₹/year)</label><input type="number" value={form.default_fee} onChange={f('default_fee')} className={inp} placeholder="150000" /></div>
        <div><label className={lbl}>Fee Min (₹/year)</label><input type="number" value={form.fee_min} onChange={f('fee_min')} className={inp} placeholder="80000" /></div>
        <div className="col-span-2"><label className={lbl}>Fee Max (₹/year)</label><input type="number" value={form.fee_max} onChange={f('fee_max')} className={inp} placeholder="500000" /></div>

        <div className="col-span-2"><label className={lbl}>Short Description</label><textarea value={form.description} onChange={f('description')} rows={2} className={inp+' resize-none'} placeholder="Course tagline shown on cards" /></div>

        <div className="col-span-2">
          <CloudinaryUpload label="Overview Image" value={form.overview_image}
            onChange={v => setForm(p => ({ ...p, overview_image: v }))}
            folder="courses" aspect="landscape"
            hint="Hero image shown on /courses/[slug] page"
          />
        </div>

        <div className="col-span-2"><label className={lbl}>Overview Content (HTML supported)</label><textarea value={form.overview_content} onChange={f('overview_content')} rows={8} className={inp+' resize-none font-mono text-xs leading-relaxed'} placeholder="<h2>About the course</h2><p>...</p>" /></div>

        <div className="col-span-2"><label className={lbl}>Syllabus / Curriculum (HTML)</label><textarea value={form.syllabus} onChange={f('syllabus')} rows={6} className={inp+' resize-none font-mono text-xs leading-relaxed'} placeholder="<h3>Year 1</h3><ul><li>...</li></ul>" /></div>

        <div className="col-span-2"><label className={lbl}>Career Scope / Jobs</label><textarea value={form.scope_jobs} onChange={f('scope_jobs')} rows={4} className={inp+' resize-none'} placeholder="Software Engineer, Data Scientist, Product Manager..." /></div>

        <div><label className={lbl}>Avg. Starting Salary</label><input value={form.avg_salary} onChange={f('avg_salary')} className={inp} placeholder="₹6-12 LPA" /></div>
        <div><label className={lbl}>Top Hiring Colleges (text)</label><input value={form.top_colleges_text} onChange={f('top_colleges_text')} className={inp} placeholder="IITs, NITs, BITS..." /></div>
      </div>

      <div className="pt-4 border-t border-white/8 flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={f('is_active')} className="rounded" />
          Active (visible to students)
        </label>
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-white/8">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? 'Saving…' : isNew ? 'Create Course' : 'Save Changes'}
        </button>
        {!isNew && (
          <button onClick={deleteCourse}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl text-sm transition-all">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        )}
      </div>
    </div>
  )
}
