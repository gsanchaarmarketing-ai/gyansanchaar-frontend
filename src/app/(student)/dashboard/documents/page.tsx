'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { uploadDocument, deleteDocument } from '@/lib/student-api'
import { toast } from 'sonner'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Link from 'next/link'
import { ArrowLeft, FileText, Upload, Trash2, Download, Loader2 } from 'lucide-react'

const DOC_TYPES = [
  { value: 'marksheet_10',     label: '10th Marksheet' },
  { value: 'marksheet_12',     label: '12th Marksheet' },
  { value: 'graduation_final', label: 'Graduation Marksheet' },
  { value: 'id_proof',         label: 'ID Proof (Aadhaar/Passport)' },
  { value: 'photo',            label: 'Passport Photo' },
]

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingType, setPendingType] = useState<string>('')

  async function load() {
    const sb = createBrowserSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await sb.from('documents').select('*').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false })
    setDocs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function trigger(type: string) {
    setPendingType(type)
    fileRef.current?.click()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingType) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return }

    setUploading(pendingType)
    try {
      await uploadDocument(file, pendingType)
      toast.success('Uploaded!')
      await load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(null)
      setPendingType('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(id)
      toast.success('Deleted')
      setDocs(p => p.filter(d => d.id !== id))
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </Link>

        <h1 className="text-xl font-bold text-heading mb-2">My Documents</h1>
        <p className="text-muted text-sm mb-5">Upload once. Reuse for every application.</p>

        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />

        <div className="space-y-3">
          {DOC_TYPES.map(t => {
            const existing = docs.find(d => d.type === t.value)
            return (
              <div key={t.value} className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-heading text-sm">{t.label}</div>
                    {existing ? (
                      <div className="text-muted text-xs mt-0.5 truncate">
                        {existing.original_filename}
                      </div>
                    ) : (
                      <div className="text-muted text-xs mt-0.5">Not uploaded</div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      {existing && (
                        <>
                          <a href={existing.path} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary text-xs font-semibold">
                            <Download className="w-3 h-3" /> View
                          </a>
                          <button onClick={() => handleDelete(existing.id)}
                            className="inline-flex items-center gap-1 text-rose-500 text-xs font-semibold">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </>
                      )}
                      <button onClick={() => trigger(t.value)} disabled={uploading === t.value}
                        className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold ml-auto disabled:opacity-50">
                        {uploading === t.value
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                          : <><Upload className="w-3 h-3" />{existing ? 'Replace' : 'Upload'}</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-muted mt-6">
          🔒 Your documents are encrypted and only visible to you and the colleges you apply to. DPDP Act 2023 compliant.
        </p>
      </main>
      <MobileNav />
    </>
  )
}
