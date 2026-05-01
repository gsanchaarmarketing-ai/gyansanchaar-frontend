'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/student-api'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { CheckCircle, GraduationCap, BookOpen, Microscope, Award, Upload, X, FileCheck } from 'lucide-react'

// ── SCHEMAS ────────────────────────────────────────────────────────────────
const step2Schema = z.object({
  father_name: z.string().min(2, 'Required'),
  email:       z.string().email('Valid email required'),
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

const LEVEL_DOCS: Record<string, string[]> = {
  ug:          ['marksheet_10', 'marksheet_12'],
  pg:          ['marksheet_10', 'marksheet_12', 'graduation_final'],
  phd:         ['marksheet_10', 'marksheet_12', 'graduation_final', 'pg_final'],
  diploma:     ['marksheet_10'],
  certificate: ['marksheet_10'],
  other:       ['marksheet_10'],
}

const LEVEL_LABELS: Record<string, string> = {
  ug: 'Under Graduation', pg: 'Post Graduation', phd: 'PhD / Doctorate',
  diploma: 'Diploma', certificate: 'Certificate', other: 'Other',
}

const DOC_LABELS: Record<string, string> = {
  marksheet_10:    '10th Marksheet',
  marksheet_12:    '12th / Intermediate Marksheet',
  graduation_final:'Graduation Final Year Marksheet',
  pg_final:        'PG Final Year Marksheet',
}

// Common branches for each course type
const COURSE_BRANCHES: Record<string, string[]> = {
  'btech-cse':    ['Computer Science', 'AI & ML', 'Data Science', 'Cyber Security', 'IoT', 'Cloud Computing'],
  'btech-ece':    ['Electronics & Communication', 'VLSI Design', 'Embedded Systems'],
  'btech-me':     ['Mechanical', 'Mechatronics', 'Automotive', 'Robotics'],
  'btech-ce':     ['Civil', 'Structural', 'Construction Management'],
  'mba':          ['Finance', 'Marketing', 'HR', 'IT', 'Business Analytics', 'Operations', 'International Business'],
  'pgdm':         ['Finance', 'Marketing', 'HR', 'Business Analytics'],
  'bdes':         ['Product Design', 'Communication Design', 'Fashion Design'],
}

interface Props {
  user: any
  states: any[]
  courses: any[]
}

export default function ApplicationWizard({ user, states, courses }: Props) {
  const router = useRouter()
  const sb     = createBrowserSupabaseClient()

  const [step,            setStep]         = useState(1)
  const [formData,        setFormData]     = useState<Record<string, any>>({})
  const [selectedCourse,  setSelectedCourse] = useState<any>(null)
  const [docs,            setDocs]         = useState<{ type: string; url: string; filename: string }[]>([])
  const [uploading,       setUploading]    = useState<string | null>(null)
  const [notAvailable,    setNotAvailable] = useState<Record<string, boolean>>({})
  const [saving,          setSaving]       = useState(false)

  const step2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      father_name: user.father_name ?? '',
      email:       user.email ?? '',
      alt_phone:   user.alt_phone ?? '',
      address:     user.address ?? '',
      state_id:    user.state_id ? String(user.state_id) : '',
      city:        user.city ?? '',
      pincode:     user.pincode ?? '',
    },
  })

  const step3 = useForm({ resolver: zodResolver(step3Schema) })

  function handleStep1() { setStep(2) }

  const handleStep2 = step2.handleSubmit(v => {
    setFormData(p => ({ ...p, ...v }))
    setStep(3)
  })

  const handleStep3 = step3.handleSubmit(v => {
    const course = courses.find(c => c.id === Number(v.course_id))
    setSelectedCourse(course)
    setFormData(p => ({ ...p, course_id: v.course_id, branch: v.branch ?? '' }))
    setStep(4)
  })

  const requiredDocs: string[] = selectedCourse ? (LEVEL_DOCS[selectedCourse.level] ?? []) : []
  const allDocsHandled = requiredDocs.every(d => docs.some(x => x.type === d) || notAvailable[d])

  async function handleFileUpload(type: string, file: File) {
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB per file'); return }
    setUploading(type)
    const result = await uploadToCloudinary(file, 'colleges/gallery') // reuse student docs folder via path
    setUploading(null)
    if (!result.ok) { toast.error(`Upload failed: ${result.error}`); return }
    setDocs(p => [...p.filter(x => x.type !== type), { type, url: result.url, filename: file.name }])
    toast.success(`${DOC_LABELS[type]} uploaded`)
  }

  async function submitApplication() {
    setSaving(true)
    try {
      // 1. Update profile
      await updateProfile({
        father_name: formData.father_name,
        alt_phone:   formData.alt_phone || undefined,
        address:     formData.address,
        city:        formData.city,
        pincode:     formData.pincode,
        state_id:    formData.state_id ? Number(formData.state_id) : undefined,
      })

      // 2. Save course selection in profile preferences
      await sb.from('profiles').update({
        entrance_exam: formData.branch ? `${selectedCourse?.name} (${formData.branch})` : selectedCourse?.name,
        updated_at:    new Date().toISOString(),
      }).eq('id', user.id)

      // 3. Insert documents
      const docRows = docs.map(d => ({
        user_id:           user.id,
        type:              d.type,
        path:              d.url,
        original_filename: d.filename,
        mime_type:         d.url.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        size_bytes:        0, // unknown after Cloudinary upload — set 0 placeholder
        sha256_hash:       'cloudinary',
      }))

      if (docRows.length) {
        const { error } = await sb.from('documents').insert(docRows)
        if (error) console.warn('Document insert:', error.message)
      }

      // 4. Mark "not available" docs in profile metadata for follow-up
      const naList = Object.keys(notAvailable).filter(k => notAvailable[k])
      if (naList.length) {
        await sb.from('audit_logs').insert({
          actor_id:   user.id,
          action:     'application_form_completed',
          subject_type: 'profile',
          metadata:   { pending_documents: naList, course: selectedCourse?.name, branch: formData.branch },
        }).then(() => {})
      }

      toast.success('Application form complete! You can now apply to colleges.', { duration: 4000 })
      router.push('/colleges')
    } catch (e: any) {
      toast.error(e.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none'

  return (
    <div className="space-y-5">
      {/* ── Stepper ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i + 1 < step  ? 'bg-success text-white' :
              i + 1 === step ? 'bg-primary text-white' : 'bg-border text-muted'
            }`}>
              {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-success' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Confirm pre-filled info ─────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-heading">Confirm your details</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted">Name:</span> <strong>{user.name}</strong></div>
            <div>
              <span className="text-muted">Phone (WhatsApp):</span> <strong>+91 {user.phone}</strong>{' '}
              {user.phone_verified_at
                ? <span className="text-success text-xs">✓ Verified</span>
                : <span className="text-warning text-xs">⚠ Not verified</span>}
            </div>
          </div>
          {!user.phone_verified_at && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-xs text-body">
              Please verify your phone number first via the Profile page to receive WhatsApp updates on your applications.
            </div>
          )}
          <button onClick={handleStep1}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors">
            This is correct — Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Personal details ────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-heading">Personal details</h2>

          {[
            { name: 'father_name', label: "Father's Name",      type: 'text',  req: true  },
            { name: 'email',       label: 'Email ID',           type: 'email', req: true  },
            { name: 'alt_phone',   label: 'Alternate Contact',  type: 'tel',   req: false },
            { name: 'address',     label: 'Complete Address',   type: 'text',  req: true  },
            { name: 'city',        label: 'City',               type: 'text',  req: true  },
            { name: 'pincode',     label: 'Pincode',            type: 'text',  req: true  },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">
                {f.label} {f.req && <span className="text-rose-500">*</span>}
              </label>
              <input type={f.type} {...step2.register(f.name as any)} className={inp} />
              {step2.formState.errors[f.name as keyof typeof step2.formState.errors] && (
                <p className="text-rose-600 text-xs mt-0.5">
                  {String(step2.formState.errors[f.name as keyof typeof step2.formState.errors]?.message ?? '')}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">State <span className="text-rose-500">*</span></label>
            <select {...step2.register('state_id')} className={inp}>
              <option value="">Select state</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 border border-border py-2.5 rounded-xl text-sm">Back</button>
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors">Continue</button>
          </div>
        </form>
      )}

      {/* ── Step 3: Course selection (with branches) ──────────────────── */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-heading">Which course are you applying for?</h2>
          <p className="text-muted text-sm">Pick the primary course you're interested in. You can apply to multiple colleges offering this course later.</p>

          <div>
            <label className="block text-sm font-medium mb-1">Course <span className="text-rose-500">*</span></label>
            <select {...step3.register('course_id')} className={inp}
              onChange={e => {
                step3.setValue('course_id', e.target.value)
                step3.setValue('branch', '')
                const c = courses.find(x => x.id === Number(e.target.value))
                setSelectedCourse(c)
              }}>
              <option value="">Select a course</option>
              {/* Group by level */}
              {['ug', 'pg', 'diploma', 'phd', 'certificate'].map(lvl => {
                const courseOfLevel = courses.filter(c => c.level === lvl)
                if (!courseOfLevel.length) return null
                return (
                  <optgroup key={lvl} label={LEVEL_LABELS[lvl]}>
                    {courseOfLevel.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.duration_months / 12} yrs)</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            {step3.formState.errors.course_id && (
              <p className="text-rose-600 text-xs mt-0.5">{String(step3.formState.errors.course_id.message ?? '')}</p>
            )}
          </div>

          {/* Dynamic branches */}
          {selectedCourse && COURSE_BRANCHES[selectedCourse.slug]?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Specialisation / Branch</label>
              <select {...step3.register('branch')} className={inp}>
                <option value="">No specific branch</option>
                {COURSE_BRANCHES[selectedCourse.slug].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">Available branches may vary by college.</p>
            </div>
          )}

          {selectedCourse && (
            <div className="bg-primary-light border border-primary/20 rounded-xl p-3 text-xs text-body">
              <div className="font-semibold mb-1">{selectedCourse.name}</div>
              <div className="text-muted">
                Level: {LEVEL_LABELS[selectedCourse.level]} ·{' '}
                Duration: {selectedCourse.duration_months} months
                {selectedCourse.default_fee > 0 && ` · Avg fee: ₹${(selectedCourse.default_fee / 100000).toFixed(1)}L/yr`}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(2)} className="flex-1 border border-border py-2.5 rounded-xl text-sm">Back</button>
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors">Continue</button>
          </div>
        </form>
      )}

      {/* ── Step 4: Document upload ───────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-bold text-heading">Upload documents</h2>
            <p className="text-muted text-sm">PDF, JPG, or PNG · Max 10MB each</p>
          </div>

          <div className="space-y-3">
            {requiredDocs.map(type => {
              const uploaded = docs.find(d => d.type === type)
              const isNA     = notAvailable[type]
              const isPgGrad = (type === 'graduation_final' || type === 'pg_final')

              return (
                <div key={type} className={`border rounded-xl p-3 ${uploaded ? 'border-success bg-success/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{DOC_LABELS[type]}</span>
                    {uploaded && <FileCheck className="w-4 h-4 text-success" />}
                  </div>

                  {!uploaded && !isNA && (
                    <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3 cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-4 h-4 text-muted" />
                      <span className="text-xs text-muted">
                        {uploading === type ? 'Uploading…' : 'Choose file'}
                      </span>
                      <input type="file" accept="image/*,application/pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(type, f) }}
                        disabled={!!uploading} />
                    </label>
                  )}

                  {uploaded && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-body truncate flex-1">{uploaded.filename}</span>
                      <button onClick={() => setDocs(p => p.filter(d => d.type !== type))}
                        className="text-rose-500 hover:text-rose-700 ml-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isPgGrad && !uploaded && (
                    <label className="flex items-center gap-2 mt-2 text-xs text-muted cursor-pointer">
                      <input type="checkbox" checked={!!isNA}
                        onChange={e => setNotAvailable(p => ({ ...p, [type]: e.target.checked }))}
                        className="rounded" />
                      Document not available yet (will be uploaded later)
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(3)} className="flex-1 border border-border py-2.5 rounded-xl text-sm">Back</button>
            <button onClick={() => setStep(5)} disabled={!allDocsHandled}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-primary-hover transition-colors">
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Review & Submit ───────────────────────────────────── */}
      {step === 5 && (
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-heading">Review your application</h2>

          <div className="space-y-3 text-sm">
            <div className="border-b border-border pb-2">
              <div className="text-xs text-muted mb-1">Personal</div>
              <div><strong>{user.name}</strong> · {user.phone && `+91 ${user.phone}`} · {formData.email}</div>
              <div className="text-xs text-body mt-1">Father: {formData.father_name}</div>
              <div className="text-xs text-body">{formData.address}, {formData.city} - {formData.pincode}</div>
            </div>

            <div className="border-b border-border pb-2">
              <div className="text-xs text-muted mb-1">Course</div>
              <div><strong>{selectedCourse?.name}</strong> {formData.branch && `· ${formData.branch}`}</div>
              <div className="text-xs text-body mt-1">{LEVEL_LABELS[selectedCourse?.level ?? 'ug']} · {selectedCourse?.duration_months} months</div>
            </div>

            <div>
              <div className="text-xs text-muted mb-1">Documents ({docs.length}/{requiredDocs.length})</div>
              {docs.map(d => (
                <div key={d.type} className="flex items-center gap-2 text-xs">
                  <FileCheck className="w-3.5 h-3.5 text-success" />
                  {DOC_LABELS[d.type]}
                </div>
              ))}
              {Object.keys(notAvailable).filter(k => notAvailable[k]).map(k => (
                <div key={k} className="flex items-center gap-2 text-xs text-warning">
                  ⚠ {DOC_LABELS[k]} — pending
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-light border border-primary/20 rounded-xl p-3 text-xs text-body">
            By submitting, you agree to share these details with colleges you apply to. Your data is protected under DPDP Act 2023.
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(4)} className="flex-1 border border-border py-2.5 rounded-xl text-sm">Back</button>
            <button onClick={submitApplication} disabled={saving}
              className="flex-1 bg-success text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 hover:bg-success-hover transition-colors">
              {saving ? 'Saving…' : '✓ Complete & Browse Colleges'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
