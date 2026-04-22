'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { studentApi, type User, type State, type Course } from '@/lib/api'
import { CheckCircle } from 'lucide-react'

// ── Step schemas ──────────────────────────────────────────────────────────────

const step2Schema = z.object({
  father_name: z.string().min(2, 'Required'),
  alt_phone:   z.string().regex(/^\d{10}$/, '10-digit number').optional().or(z.literal('')),
  address:     z.string().min(5, 'Required'),
  state_id:    z.string().min(1, 'Required'),
  city:        z.string().min(1, 'Required'),
  pincode:     z.string().regex(/^\d{6}$/, '6-digit pincode'),
})

const step3Schema = z.object({
  course_id: z.string().min(1, 'Select a course'),
  branch:    z.string().optional(),
})

const STEPS = ['Personal', 'Details', 'Course', 'Documents', 'Review']

interface Props {
  user: User
  states: State[]
  courses: Course[]
  token: string
}

export default function ApplicationWizard({ user, states, courses, token }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [docs, setDocs] = useState<{ type: string; file: File }[]>([])
  const [notAvailable, setNotAvailable] = useState(false)
  const [saving, setSaving] = useState(false)

  const step2 = useForm({ resolver: zodResolver(step2Schema) })
  const step3 = useForm({ resolver: zodResolver(step3Schema) })

  const selectedCourse = courses.find(c => String(c.id) === step3.watch('course_id'))
  const isPostGrad = selectedCourse?.level === 'pg'

  // Step 1: pre-filled, just show and confirm
  const handleStep1 = () => {
    setFormData(prev => ({ ...prev, name: user.name, phone: user.phone }))
    setStep(2)
  }

  // Step 2: personal details
  const handleStep2 = step2.handleSubmit(values => {
    setFormData(prev => ({ ...prev, ...values }))
    setStep(3)
  })

  // Step 3: course
  const handleStep3 = step3.handleSubmit(values => {
    setFormData(prev => ({ ...prev, ...values }))
    setStep(4)
  })

  // Step 4: document upload
  const handleDocUpload = (type: string, file: File) => {
    setDocs(prev => {
      const filtered = prev.filter(d => d.type !== type)
      return [...filtered, { type, file }]
    })
  }

  const handleStep4 = () => setStep(5)

  // Step 5: submit — save profile + documents
  const handleSubmit = async () => {
    setSaving(true)
    try {
      // Update profile
      await studentApi.updateProfile(token, {
        father_name: formData.father_name,
        alt_phone:   formData.alt_phone,
        address:     formData.address,
        state_id:    Number(formData.state_id),
        city:        formData.city,
        pincode:     formData.pincode,
      })

      // Upload documents
      for (const { type, file } of docs) {
        const fd = new FormData()
        fd.append('type', type)
        fd.append('file', file)
        if (notAvailable && type === 'graduation_final') {
          fd.append('document_not_available', '1')
        }
        await studentApi.uploadDocument(token, fd)
      }

      toast.success('Application profile saved! Now browse colleges and apply.')
      router.push('/colleges')
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
              i + 1 < step ? 'bg-emerald-500 text-white' :
              i + 1 === step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Pre-filled */}
      {step === 1 && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Confirm your details</h2>
          <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
            <div><span className="text-slate-500">Name:</span> <strong>{user.name}</strong></div>
            <div><span className="text-slate-500">Phone (verified):</span> <strong>{user.phone}</strong> ✓</div>
          </div>
          <button onClick={handleStep1} className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Personal details */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Personal details</h2>
          {[
            { name: 'father_name', label: "Father's Name", type: 'text', required: true },
            { name: 'alt_phone', label: 'Alternate Contact', type: 'tel', required: false },
            { name: 'address', label: 'Address', type: 'text', required: true },
            { name: 'city', label: 'City', type: 'text', required: true },
            { name: 'pincode', label: 'Pincode', type: 'text', required: true },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label} {f.required && <span className="text-rose-500">*</span>}</label>
              <input type={f.type} {...step2.register(f.name as any)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              {step2.formState.errors[f.name as keyof typeof step2.formState.errors] && (
                <p className="text-rose-600 text-xs mt-0.5">
                  {String(step2.formState.errors[f.name as keyof typeof step2.formState.errors]?.message ?? '')}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">State <span className="text-rose-500">*</span></label>
            <select {...step2.register('state_id')} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select state</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 border py-2.5 rounded-lg text-sm">Back</button>
            <button type="submit" className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm">Continue</button>
          </div>
        </form>
      )}

      {/* Step 3: Course */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Select Course</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Course <span className="text-rose-500">*</span></label>
            <select {...step3.register('course_id')} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select course</option>
              {['ug','pg','diploma','phd','certificate'].map(level => {
                const levelCourses = courses.filter(c => c.level === level)
                if (!levelCourses.length) return null
                return (
                  <optgroup key={level} label={level.toUpperCase()}>
                    {levelCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                )
              })}
            </select>
            {step3.formState.errors.course_id && (
              <p className="text-rose-600 text-xs mt-0.5">{(step3.formState.errors.course_id.message as string)}</p>
            )}
          </div>
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium mb-1">Branch (optional)</label>
              <input type="text" {...step3.register('branch')} placeholder="e.g., Computer Science"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 border py-2.5 rounded-lg text-sm">Back</button>
            <button type="submit" className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm">Continue</button>
          </div>
        </form>
      )}

      {/* Step 4: Documents */}
      {step === 4 && (
        <div className="bg-white border rounded-xl p-5 space-y-5">
          <h2 className="font-semibold">Upload Documents</h2>
          <div className="text-xs text-slate-500">PDF, JPG, PNG, WebP · max 5 MB each</div>

          {['marksheet_10', 'marksheet_12'].map(type => (
            <div key={type}>
              <label className="block text-sm font-medium mb-1">
                {type === 'marksheet_10' ? '10th Marksheet' : '12th Marksheet'} <span className="text-rose-500">*</span>
              </label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => e.target.files?.[0] && handleDocUpload(type, e.target.files[0])}
                className="w-full text-sm" />
              {docs.find(d => d.type === type) && <p className="text-emerald-600 text-xs mt-1">✓ {docs.find(d => d.type === type)!.file.name}</p>}
            </div>
          ))}

          {isPostGrad && (
            <div>
              <label className="block text-sm font-medium mb-1">Graduation Final Marksheet</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => e.target.files?.[0] && handleDocUpload('graduation_final', e.target.files[0])}
                className="w-full text-sm" disabled={notAvailable} />
              <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                <input type="checkbox" checked={notAvailable} onChange={e => setNotAvailable(e.target.checked)} />
                Document not available yet
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="flex-1 border py-2.5 rounded-lg text-sm">Back</button>
            <button type="button" onClick={handleStep4} className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm">Continue</button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Review & Submit</h2>
          <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1.5">
            {[['Name', user.name], ["Father's name", formData.father_name], ['Phone', user.phone], ['Address', `${formData.address}, ${formData.city} - ${formData.pincode}`], ['Course', selectedCourse?.name ?? '—'], ['Branch', formData.branch || '—']].map(([k,v]) => (
              <div key={k} className="flex gap-2"><span className="text-slate-500 w-28 flex-shrink-0">{k}:</span><strong>{v}</strong></div>
            ))}
          </div>
          <div className="text-xs text-slate-500">
            By submitting, your profile is saved and you can apply to any college with a single click.
            <br />Your data is handled per the <a href="/privacy" className="underline text-brand-600" target="_blank">Privacy Policy</a>.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(4)} className="flex-1 border py-2.5 rounded-lg text-sm">Back</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Save & Browse Colleges'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
