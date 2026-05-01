'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Calendar, FileText, Phone, Mail, MapPin, User as UserIcon, Save, Download, Clock } from 'lucide-react'

const STATUSES = [
  { value: 'applied',             label: 'Applied' },
  { value: 'approved',            label: 'Approved' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'admitted',            label: 'Admitted' },
  { value: 'rejected',            label: 'Rejected' },
  { value: 'withdrawn',           label: 'Withdrawn' },
]

const DOC_LABELS: Record<string, string> = {
  marksheet_10:    '10th Marksheet',
  marksheet_12:    '12th / Intermediate Marksheet',
  graduation_final:'Graduation Final',
  pg_final:        'PG Final',
  id_proof:        'ID Proof',
  photo:           'Photo',
}

export default function ApplicationManager({ application, studentEmail, documents }: any) {
  const router = useRouter()
  const sb     = createBrowserSupabaseClient()
  const [saving, setSaving] = useState(false)

  const profile = application.profiles
  const college = application.colleges
  const course  = application.courses

  const [status, setStatus] = useState(application.status)
  const [note,   setNote]   = useState('')
  const [interviewAt, setInterviewAt] = useState(application.interview_at ?? '')
  const [letterUrl, setLetterUrl]     = useState(application.admission_letter_path ?? '')
  const [internalNotes, setInternalNotes] = useState(application.notes_internal ?? '')

  async function updateStatus() {
    setSaving(true)
    try {
      const { data: { user } } = await sb.auth.getUser()
      const updates: any = { status, updated_at: new Date().toISOString() }
      if (status === 'interview_scheduled' && interviewAt) updates.interview_at = interviewAt
      if (letterUrl !== application.admission_letter_path) {
        updates.admission_letter_path = letterUrl || null
        if (letterUrl) {
          updates.admission_letter_uploaded_at = new Date().toISOString()
          updates.admission_letter_uploaded_by = user?.id
          // Auto-set status to admitted when letter uploaded
          if (status !== 'admitted') updates.status = 'admitted'
        }
      }
      updates.notes_internal = internalNotes || null

      const { error } = await sb.from('applications').update(updates).eq('id', application.id)
      if (error) throw error

      // Log status change
      if (status !== application.status || (letterUrl && letterUrl !== application.admission_letter_path)) {
        await sb.from('application_status_histories').insert({
          application_id: application.id,
          from_status:    application.status,
          to_status:      updates.status ?? status,
          actor_id:       user?.id,
          note:           note || (letterUrl !== application.admission_letter_path ? 'Admission letter uploaded' : null),
        })
      }

      toast.success('Application updated! Student will receive WhatsApp + email notification.')
      router.refresh()
      setNote('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* ── LEFT: Student Info ──────────────────────────────────────────── */}
      <div className="col-span-1 space-y-4">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Student</div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <UserIcon className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
              <div>
                <div className="text-white font-medium">{profile?.name}</div>
                {profile?.father_name && <div className="text-white/40 text-xs">S/o {profile.father_name}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <a href={`https://wa.me/91${profile?.phone}`} target="_blank" className="text-white/70 hover:text-emerald-400 text-xs">
                +91 {profile?.phone} (WhatsApp)
              </a>
            </div>
            {profile?.alt_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-white/70 text-xs">+91 {profile.alt_phone} (alt)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <a href={`mailto:${studentEmail}`} className="text-white/70 hover:text-blue-400 text-xs truncate">{studentEmail}</a>
            </div>
            {profile?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                <div className="text-white/60 text-xs">
                  {profile.address}<br />{profile.city}{profile.states?.name ? `, ${profile.states.name}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Documents */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Documents ({documents.length})</div>
          {documents.length === 0 && <div className="text-white/20 text-xs">No documents uploaded yet</div>}
          {documents.map((d: any) => (
            <a key={d.id} href={d.path} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors group">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-xs font-medium truncate">{DOC_LABELS[d.type] ?? d.type}</div>
                <div className="text-white/30 text-[10px] truncate">{d.original_filename}</div>
              </div>
              <Download className="w-3 h-3 text-white/20 group-hover:text-white/60" />
            </a>
          ))}
        </div>

        {/* Status History */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Activity Log</div>
          {(application.application_status_histories ?? []).length === 0 && <div className="text-white/20 text-xs">No status changes yet</div>}
          {(application.application_status_histories ?? []).map((h: any) => (
            <div key={h.id} className="text-xs border-l-2 border-white/10 pl-3 py-1.5 mb-2">
              <div className="text-white/70 capitalize">
                {h.from_status?.replace(/_/g,' ') ?? '—'} → <strong>{h.to_status.replace(/_/g,' ')}</strong>
              </div>
              {h.note && <div className="text-white/40 mt-0.5">{h.note}</div>}
              <div className="text-white/20 text-[10px] mt-0.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {new Date(h.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Application + Status Manager ─────────────────────── */}
      <div className="col-span-2 space-y-4">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Applying To</div>
          <div className="text-lg font-bold text-white">{college?.name}</div>
          <div className="text-white/40 text-sm mt-0.5">{college?.city}</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-white/80 font-medium text-sm">{course?.name}</div>
            <div className="text-white/40 text-xs mt-0.5">
              {course?.level?.toUpperCase()} · {course?.duration_months}mo
              {application.branch && ` · Specialisation: ${application.branch}`}
            </div>
          </div>
        </div>

        {/* Status Manager */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-4">Manage Application</div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {(status === 'interview_scheduled' || application.interview_at) && (
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Interview Date & Time</label>
                <input type="datetime-local" value={interviewAt ? interviewAt.slice(0,16) : ''}
                  onChange={e => setInterviewAt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40" />
              </div>
            )}

            <div>
              <CloudinaryUpload
                label="Admission Letter (PDF or image)"
                value={letterUrl}
                onChange={setLetterUrl}
                folder="colleges/gallery"
                aspect="landscape"
                hint="Once uploaded, status auto-changes to 'Admitted' and student gets WhatsApp + Email notification"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Internal Notes (only visible to admins)</label>
              <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3}
                placeholder="e.g. Student called, requested branch change to AI/ML"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 resize-none" />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Status Change Note (visible in student timeline)</label>
              <input value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Application reviewed and shortlisted for personal interview"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40" />
            </div>

            <button onClick={updateStatus} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Update Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
