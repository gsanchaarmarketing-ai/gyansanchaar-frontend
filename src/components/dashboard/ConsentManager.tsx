'use client'
import { useState } from 'react'
import { updateConsent } from '@/lib/student-api'
import { toast } from 'sonner'

const PURPOSES = [
  { key: 'application',   label: 'Application Processing', desc: 'Required to apply to colleges' },
  { key: 'communication', label: 'Status Updates',         desc: 'Email & WhatsApp notifications' },
  { key: 'marketing',     label: 'Marketing & Offers',     desc: 'Optional promotional content' },
  { key: 'analytics',     label: 'Anonymous Analytics',    desc: 'Helps us improve the platform' },
]

export default function ConsentManager({ initialState }: { initialState: Record<string, boolean> }) {
  const [state, setState] = useState(initialState)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(purpose: string) {
    const newVal = !state[purpose]
    setSaving(purpose)
    try {
      await updateConsent(purpose, newVal)
      setState(p => ({ ...p, [purpose]: newVal }))
      toast.success(`Updated ${purpose} consent`)
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(null) }
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h2 className="font-bold text-heading mb-3">Consent preferences</h2>
      <p className="text-muted text-xs mb-4">DPDP Act 2023 §6 — granular consent. Toggle anytime.</p>
      <div className="space-y-3">
        {PURPOSES.map(p => {
          const granted = state[p.key] ?? false
          const required = p.key === 'application'
          return (
            <div key={p.key} className="flex items-start justify-between gap-3 py-2 border-t border-border first:border-0">
              <div className="flex-1">
                <div className="font-semibold text-heading text-sm">{p.label}{required && <span className="text-rose-500 text-xs ml-1">*Required</span>}</div>
                <div className="text-muted text-xs mt-0.5">{p.desc}</div>
              </div>
              <button onClick={() => !required && toggle(p.key)} disabled={saving === p.key || required}
                className={`relative w-11 h-6 rounded-full transition-colors ${granted ? 'bg-primary' : 'bg-slate-300'} ${required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className={`absolute top-0.5 ${granted ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
