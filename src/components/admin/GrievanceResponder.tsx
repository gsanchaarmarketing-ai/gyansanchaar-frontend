'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, Shield } from 'lucide-react'

const STATUSES = ['open','acknowledged','in_progress','resolved','rejected','escalated']

export default function GrievanceResponder({ grievance }: { grievance: any }) {
  const router = useRouter()
  const sb     = createBrowserSupabaseClient()
  const [status,     setStatus]     = useState(grievance.status)
  const [message,    setMessage]    = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [resolution, setResolution] = useState(grievance.resolution_note ?? '')
  const [saving,     setSaving]     = useState(false)

  async function respond() {
    if (!message.trim()) { toast.error('Message required'); return }
    setSaving(true)
    try {
      const { data: { user } } = await sb.auth.getUser()

      // Save response
      const { error: rErr } = await sb.from('grievance_responses').insert({
        grievance_id: grievance.id,
        responder_id: user?.id,
        message,
        is_internal: isInternal,
        sent_to_complainant: !isInternal,
        sent_at: new Date().toISOString(),
      })
      if (rErr) throw rErr

      // Update grievance status
      const updates: any = { status, updated_at: new Date().toISOString() }
      if (status === 'acknowledged' && grievance.status === 'open') {
        updates.acknowledged_at = new Date().toISOString()
      }
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
        updates.resolution_note = resolution || message
      }
      if (!grievance.assigned_to_id) updates.assigned_to_id = user?.id

      await sb.from('grievances').update(updates).eq('id', grievance.id)

      toast.success('Response saved. Student will receive email notification.')
      setMessage('')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'

  return (
    <div className="space-y-4">
      {/* Original complaint */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Original Complaint</div>
        <div className="text-white font-semibold mb-2">{grievance.subject}</div>
        <div className="text-white/60 text-sm leading-relaxed">{grievance.description}</div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-white/30">
          <span>From: <strong className="text-white/60">{grievance.complainant_name}</strong></span>
          <span>Email: <a href={`mailto:${grievance.complainant_email}`} className="text-blue-400">{grievance.complainant_email}</a></span>
          {grievance.complainant_phone && <span>Phone: {grievance.complainant_phone}</span>}
          <span>Filed: {new Date(grievance.created_at).toLocaleDateString('en-IN')}</span>
        </div>
        {grievance.category === 'data_erasure' && (
          <div className="mt-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-violet-400">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            DPDP Act 2023 §12 Data Erasure Request — must be processed within 30 days.
          </div>
        )}
      </div>

      {/* Previous responses */}
      {grievance.grievance_responses?.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Responses ({grievance.grievance_responses.length})</div>
          {grievance.grievance_responses.map((r: any) => (
            <div key={r.id} className={`rounded-2xl p-4 text-sm ${r.is_internal ? 'bg-amber-500/8 border border-amber-500/20' : 'bg-white/3 border border-white/8'}`}>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-white/60 font-medium">{r.profiles?.name ?? 'Admin'} ({r.profiles?.role ?? 'staff'})</span>
                {r.is_internal && <span className="text-amber-400 text-[10px]">Internal only</span>}
                <span className="text-white/30">{new Date(r.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}</span>
              </div>
              <div className="text-white/70 leading-relaxed whitespace-pre-wrap">{r.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Response form */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Add Response</div>

        <div>
          <label className="block text-xs text-white/50 mb-1.5">Update Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
          </select>
        </div>

        {status === 'resolved' && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Resolution Summary</label>
            <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={2}
              placeholder="Brief summary of how this was resolved"
              className={inp+' resize-none'} />
          </div>
        )}

        <div>
          <label className="block text-xs text-white/50 mb-1.5">
            {isInternal ? '🔒 Internal Note (not sent to complainant)' : '📧 Response (will be sent to complainant)'}
          </label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            placeholder={isInternal ? 'Internal note for the team…' : 'Write your response to the complainant…'}
            className={inp+' resize-none'} />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
          <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded" />
          Internal note only (not sent to complainant)
        </label>

        <button onClick={respond} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Send className="w-4 h-4" />{saving ? 'Saving…' : 'Submit Response'}
        </button>
      </div>
    </div>
  )
}
