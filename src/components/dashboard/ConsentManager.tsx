'use client'
import { useState } from 'react'
import { studentApi, type ConsentState } from '@/lib/api'
import { toast } from 'sonner'

const PURPOSES = [
  { key: 'communication', label: 'Application status updates (WhatsApp + email)', required: true },
  { key: 'marketing', label: 'College recommendations and offers', required: false },
  { key: 'analytics', label: 'Help improve the platform (anonymised)', required: false },
]

export default function ConsentManager({ initialState, token }: { initialState: ConsentState; token: string }) {
  const [state, setState] = useState(initialState)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(purpose: string, current: boolean) {
    setSaving(purpose)
    try {
      const { consent_state } = await studentApi.updateConsent(token, {
        purpose, action: current ? 'withdraw' : 'grant',
      })
      setState(consent_state)
      toast.success(current ? 'Consent withdrawn' : 'Consent granted')
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(null) }
  }

  return (
    <div className="space-y-3">
      {PURPOSES.map(({ key, label, required }) => {
        const active = state[key as keyof ConsentState]
        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600 flex-1">{label}{required && <span className="text-xs text-slate-400 ml-1">(required)</span>}</div>
            <button
              onClick={() => !required && toggle(key, active)}
              disabled={required || saving === key}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-brand-600' : 'bg-slate-300'} ${required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
