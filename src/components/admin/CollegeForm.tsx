'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Trash2, Plus, Save, Eye } from 'lucide-react'

interface Props {
  college: any
  states: { id: number; name: string }[]
  streams: { id: number; name: string }[]
  allCourses: { id: number; name: string; level: string; duration_months: number; default_fee: number }[]
  linkedCourses: any[]
  linkedStreams: number[]
}

const TABS = ['Basic Info', 'About', 'Placement', 'Hostel', 'Courses', 'Settings']

export default function CollegeForm({ college, states, streams, allCourses, linkedCourses, linkedStreams }: Props) {
  const router  = useRouter()
  const sb      = createBrowserSupabaseClient()
  const isNew   = !college?.id
  const [tab,   setTab]   = useState('Basic Info')
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name:             college?.name             ?? '',
    slug:             college?.slug             ?? '',
    type:             college?.type             ?? 'private',
    state_id:         college?.state_id         ?? '',
    city:             college?.city             ?? '',
    address:          college?.address          ?? '',
    established_year: college?.established_year ?? '',
    nirf_rank:        college?.nirf_rank        ?? '',
    naac_grade:       college?.naac_grade       ?? '',
    approvals:        college?.approvals        ?? '',
    website:          college?.website          ?? '',
    contact_email:    college?.contact_email    ?? '',
    contact_phone:    college?.contact_phone    ?? '',
    about:            college?.about            ?? '',
    fee_notes:        college?.fee_notes        ?? '',
    logo_path:        college?.logo_path        ?? '',
    campus_video_url: college?.campus_video_url ?? '',
    is_active:        college?.is_active        ?? true,
    is_featured:      college?.is_featured      ?? false,
    ugc_verified:     college?.ugc_verified     ?? false,
    // Placement
    p_rate:           college?.placement_data?.rate            ?? '',
    p_avg:            college?.placement_data?.avg_package     ?? '',
    p_high:           college?.placement_data?.highest_package ?? '',
    p_recruiters:     college?.placement_data?.top_recruiters  ?? '',
    p_year:           college?.placement_data?.year            ?? new Date().getFullYear() - 1,
    p_notes:          college?.placement_data?.notes           ?? '',
    // Hostel
    h_boys:           college?.hostel_info?.boys_hostel    ?? false,
    h_girls:          college?.hostel_info?.girls_hostel   ?? false,
    h_capacity:       college?.hostel_info?.capacity       ?? '',
    h_fee:            college?.hostel_info?.fee_per_year   ?? '',
    h_mess:           college?.hostel_info?.mess_available ?? false,
    h_ac:             college?.hostel_info?.ac_rooms       ?? false,
    h_curfew:         college?.hostel_info?.curfew         ?? '',
    h_notes:          college?.hostel_info?.notes          ?? '',
  })

  const [selStreams, setSelStreams]  = useState<number[]>(linkedStreams)
  const [courses,   setCourses]     = useState<any[]>(linkedCourses)
  const [newCourse, setNewCourse]   = useState({ course_id: '', fee: '', seats: '', branches: '', admission_process: '' })

  function f(key: string) { return (e: any) => setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })) }

  async function save() {
    if (!form.name || !form.city) { toast.error('Name and city are required'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const payload: any = {
        name: form.name, slug, type: form.type,
        state_id: form.state_id ? Number(form.state_id) : null,
        city: form.city, address: form.address || null,
        established_year: form.established_year ? Number(form.established_year) : null,
        nirf_rank: form.nirf_rank ? Number(form.nirf_rank) : null,
        naac_grade: form.naac_grade || null, approvals: form.approvals || null,
        website: form.website || null, contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null, about: form.about || null,
        fee_notes: form.fee_notes || null, logo_path: form.logo_path || null,
        campus_video_url: form.campus_video_url || null,
        is_active: form.is_active, is_featured: form.is_featured, ugc_verified: form.ugc_verified,
        placement_data: form.p_rate ? { rate: Number(form.p_rate), avg_package: form.p_avg ? Number(form.p_avg) : null, highest_package: form.p_high ? Number(form.p_high) : null, top_recruiters: form.p_recruiters || null, year: Number(form.p_year), notes: form.p_notes || null } : null,
        hostel_info: (form.h_boys || form.h_girls) ? { boys_hostel: form.h_boys, girls_hostel: form.h_girls, capacity: form.h_capacity ? Number(form.h_capacity) : null, fee_per_year: form.h_fee ? Number(form.h_fee) : null, mess_available: form.h_mess, ac_rooms: form.h_ac, curfew: form.h_curfew || null, notes: form.h_notes || null } : null,
        updated_at: new Date().toISOString(),
      }

      let collegeId = college?.id
      if (isNew) {
        const { data, error } = await sb.from('colleges').insert(payload).select('id').single()
        if (error) throw error
        collegeId = data.id
      } else {
        const { error } = await sb.from('colleges').update(payload).eq('id', college.id)
        if (error) throw error
      }

      // Sync streams
      await sb.from('college_stream').delete().eq('college_id', collegeId)
      if (selStreams.length) {
        await sb.from('college_stream').insert(selStreams.map(sid => ({ college_id: collegeId, stream_id: sid })))
      }

      toast.success(isNew ? 'College created!' : 'Saved!')
      if (isNew) router.push(`/admin/colleges/${collegeId}`)
      else router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function addCourse() {
    if (!newCourse.course_id || !college?.id) return
    const { error } = await sb.from('college_course').upsert({
      college_id: college.id, course_id: Number(newCourse.course_id),
      fee: newCourse.fee ? Number(newCourse.fee) : null,
      seats: newCourse.seats ? Number(newCourse.seats) : null,
      branches: newCourse.branches || null,
      admission_process: newCourse.admission_process || null,
      is_active: true,
    }, { onConflict: 'college_id,course_id' })
    if (error) { toast.error(error.message); return }
    const course = allCourses.find(c => c.id === Number(newCourse.course_id))
    setCourses(p => [...p.filter(c => c.course_id !== Number(newCourse.course_id)), { ...newCourse, course_id: Number(newCourse.course_id), courses: course }])
    setNewCourse({ course_id: '', fee: '', seats: '', branches: '', admission_process: '' })
    toast.success('Course linked!')
  }

  async function removeCourse(courseId: number) {
    if (!college?.id) return
    await sb.from('college_course').delete().eq('college_id', college.id).eq('course_id', courseId)
    setCourses(p => p.filter(c => c.course_id !== courseId))
    toast.success('Course removed')
  }

  async function deletecollege() {
    if (!college?.id) return
    if (!confirm(`Delete ${college.name}? This cannot be undone.`)) return
    await sb.from('colleges').update({ deleted_at: new Date().toISOString() }).eq('id', college.id)
    toast.success('Deleted')
    router.push('/admin/colleges')
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'
  const lbl = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
  const chk = 'flex items-center gap-2 text-sm text-white/60 cursor-pointer'

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/8 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm rounded-t-lg transition-colors ${tab === t ? 'bg-white/8 text-white font-medium' : 'text-white/30 hover:text-white/60'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ────────────────────────────────────────────────────── */}
      {tab === 'Basic Info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className={lbl}>College Name *</label><input value={form.name} onChange={f('name')} className={inp} placeholder="e.g. Guru Nanak University" /></div>
            <div><label className={lbl}>Slug (auto if blank)</label><input value={form.slug} onChange={f('slug')} className={inp} placeholder="guru-nanak-university" /></div>
            <div><label className={lbl}>Type *</label>
              <select value={form.type} onChange={f('type')} className={inp}>
                {['private','government','deemed','autonomous'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div><label className={lbl}>State</label>
              <select value={form.state_id} onChange={f('state_id')} className={inp}>
                <option value="">— Select state —</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>City *</label><input value={form.city} onChange={f('city')} className={inp} /></div>
            <div className="col-span-2"><label className={lbl}>Address</label><input value={form.address} onChange={f('address')} className={inp} /></div>
            <div><label className={lbl}>Established Year</label><input type="number" value={form.established_year} onChange={f('established_year')} className={inp} placeholder="2010" /></div>
            <div><label className={lbl}>NIRF Rank</label><input type="number" value={form.nirf_rank} onChange={f('nirf_rank')} className={inp} /></div>
            <div><label className={lbl}>NAAC Grade</label>
              <select value={form.naac_grade} onChange={f('naac_grade')} className={inp}>
                <option value="">— None —</option>
                {['A++','A+','A','B++','B+','B','C','D'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Approvals</label><input value={form.approvals} onChange={f('approvals')} className={inp} placeholder="UGC, AICTE, NAAC A+" /></div>
            <div><label className={lbl}>Website</label><input type="url" value={form.website} onChange={f('website')} className={inp} placeholder="https://..." /></div>
            <div><label className={lbl}>Contact Email</label><input type="email" value={form.contact_email} onChange={f('contact_email')} className={inp} /></div>
            <div><label className={lbl}>Contact Phone</label><input value={form.contact_phone} onChange={f('contact_phone')} className={inp} /></div>
            <div><label className={lbl}>Logo URL</label><input type="url" value={form.logo_path} onChange={f('logo_path')} className={inp} placeholder="https://..." /></div>
            <div><label className={lbl}>Campus Video URL</label><input type="url" value={form.campus_video_url} onChange={f('campus_video_url')} className={inp} /></div>
            <div><label className={lbl}>Fee Notes</label><textarea value={form.fee_notes} onChange={f('fee_notes')} rows={3} className={inp+' resize-none col-span-2'} /></div>
          </div>
          {/* Streams */}
          <div><label className={lbl}>Streams</label>
            <div className="flex flex-wrap gap-2">
              {streams.map(s => (
                <button key={s.id} type="button" onClick={() => setSelStreams(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selStreams.includes(s.id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
      {tab === 'About' && (
        <div>
          <label className={lbl}>About (HTML supported — use h2, h3, p, strong, ul, li)</label>
          <textarea value={form.about} onChange={f('about')} rows={20}
            className={inp+' resize-none font-mono text-xs leading-relaxed'}
            placeholder="<h2>About {College Name}</h2><p>...</p>" />
          <div className="mt-2 text-[10px] text-white/20">Supports HTML: &lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;strong&gt; &lt;ul&gt;&lt;li&gt; &lt;br&gt;</div>
        </div>
      )}

      {/* ── PLACEMENT ────────────────────────────────────────────────────── */}
      {tab === 'Placement' && (
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>Placement Year</label><input type="number" value={form.p_year} onChange={f('p_year')} className={inp} /></div>
          <div><label className={lbl}>Placement Rate (%)</label><input type="number" value={form.p_rate} onChange={f('p_rate')} className={inp} placeholder="e.g. 85" /></div>
          <div><label className={lbl}>Average Package (₹ LPA)</label><input type="number" value={form.p_avg} onChange={f('p_avg')} className={inp} placeholder="e.g. 6.5" /></div>
          <div><label className={lbl}>Highest Package (₹ LPA)</label><input type="number" value={form.p_high} onChange={f('p_high')} className={inp} placeholder="e.g. 42" /></div>
          <div className="col-span-2"><label className={lbl}>Top Recruiters (comma separated)</label><input value={form.p_recruiters} onChange={f('p_recruiters')} className={inp} placeholder="TCS, Infosys, Wipro, Amazon" /></div>
          <div className="col-span-2"><label className={lbl}>Placement Notes</label><textarea value={form.p_notes} onChange={f('p_notes')} rows={3} className={inp+' resize-none'} /></div>
        </div>
      )}

      {/* ── HOSTEL ────────────────────────────────────────────────────────── */}
      {tab === 'Hostel' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-5">
            {[['h_boys','Boys Hostel'],['h_girls','Girls Hostel'],['h_mess','Mess / Cafeteria'],['h_ac','AC Rooms']].map(([k,l]) => (
              <label key={k} className={chk}><input type="checkbox" checked={!!(form as any)[k]} onChange={f(k)} className="rounded" />{l}</label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Capacity (beds)</label><input type="number" value={form.h_capacity} onChange={f('h_capacity')} className={inp} /></div>
            <div><label className={lbl}>Annual Hostel Fee (₹)</label><input type="number" value={form.h_fee} onChange={f('h_fee')} className={inp} /></div>
            <div><label className={lbl}>Curfew Timings</label><input value={form.h_curfew} onChange={f('h_curfew')} className={inp} placeholder="e.g. 10 PM (Boys), 9 PM (Girls)" /></div>
            <div className="col-span-2"><label className={lbl}>Additional Notes</label><textarea value={form.h_notes} onChange={f('h_notes')} rows={3} className={inp+' resize-none'} /></div>
          </div>
        </div>
      )}

      {/* ── COURSES ───────────────────────────────────────────────────────── */}
      {tab === 'Courses' && (
        <div className="space-y-4">
          {isNew && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">Save the college first, then link courses.</div>}

          {!isNew && (
            <>
              {/* Add course */}
              <div className="bg-white/3 border border-white/8 rounded-xl p-5">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Link a Course</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={lbl}>Course *</label>
                    <select value={newCourse.course_id} onChange={e => setNewCourse(p => ({ ...p, course_id: e.target.value }))} className={inp}>
                      <option value="">— Select course —</option>
                      {allCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level.toUpperCase()}) — {c.duration_months}mo</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Annual Fee (₹)</label><input type="number" value={newCourse.fee} onChange={e => setNewCourse(p => ({ ...p, fee: e.target.value }))} className={inp} placeholder="e.g. 150000" /></div>
                  <div><label className={lbl}>Seats</label><input type="number" value={newCourse.seats} onChange={e => setNewCourse(p => ({ ...p, seats: e.target.value }))} className={inp} /></div>
                  <div className="col-span-2"><label className={lbl}>Branches / Specialisations</label><input value={newCourse.branches} onChange={e => setNewCourse(p => ({ ...p, branches: e.target.value }))} className={inp} placeholder="CS, AI & ML, Data Science" /></div>
                  <div className="col-span-2"><label className={lbl}>Admission Process</label><input value={newCourse.admission_process} onChange={e => setNewCourse(p => ({ ...p, admission_process: e.target.value }))} className={inp} placeholder="JEE Main / Merit" /></div>
                </div>
                <button type="button" onClick={addCourse}
                  className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                  <Plus className="w-4 h-4" />Link Course
                </button>
              </div>

              {/* Existing */}
              {courses.length > 0 && (
                <div className="space-y-2">
                  {courses.map(cc => {
                    const c = allCourses.find(x => x.id === cc.course_id) ?? (cc.courses ?? {})
                    return (
                      <div key={cc.course_id} className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-white">{c.name}</div>
                          <div className="text-[10px] text-white/30 mt-0.5 flex gap-3">
                            {cc.fee && <span>₹{Number(cc.fee).toLocaleString('en-IN')}/yr</span>}
                            {cc.seats && <span>{cc.seats} seats</span>}
                            {cc.branches && <span>{cc.branches}</span>}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeCourse(cc.course_id)}
                          className="text-white/20 hover:text-rose-400 transition-colors p-1.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              {courses.length === 0 && <div className="text-center py-8 text-white/20 text-sm">No courses linked yet</div>}
            </>
          )}
        </div>
      )}

      {/* ── SETTINGS ─────────────────────────────────────────────────────── */}
      {tab === 'Settings' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {[['is_active','Active (visible to students)'],['is_featured','Featured (shown in homepage)'],['ugc_verified','UGC Verified']].map(([k,l]) => (
              <label key={k} className={chk}>
                <input type="checkbox" checked={!!(form as any)[k]} onChange={f(k)} className="rounded" />
                <span>{l}</span>
              </label>
            ))}
          </div>
          {!isNew && (
            <div className="pt-6 border-t border-white/5">
              <button type="button" onClick={deletecollege}
                className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 px-4 py-2 rounded-xl text-sm transition-all">
                <Trash2 className="w-4 h-4" />Delete College
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── SAVE BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/8">
        <button type="button" onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : isNew ? 'Create College' : 'Save Changes'}
        </button>
        {!isNew && college?.slug && (
          <a href={`/colleges/${college.slug}`} target="_blank"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10">
            <Eye className="w-4 h-4" />Preview
          </a>
        )}
      </div>
    </div>
  )
}
