'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '@/lib/api'
import { toast } from 'sonner'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { FileText, Upload, Trash2, Download } from 'lucide-react'

const DOC_TYPES = [
  { value: 'marksheet_10', label: '10th Marksheet' },
  { value: 'marksheet_12', label: '12th Marksheet' },
  { value: 'graduation_final', label: 'Graduation Final Marksheet' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'photo', label: 'Photograph' },
  { value: 'other', label: 'Other' },
]

function getToken() { return typeof document !== 'undefined' ? document.cookie.match(/gs_token=([^;]+)/)?.[1] ?? '' : '' }

export default function DocumentsPage() {
  const qc = useQueryClient()
  const [type, setType] = useState('marksheet_10')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => studentApi.documents(getToken()),
  })

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      await studentApi.uploadDocument(getToken(), fd)
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded')
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  const deleteMut = useMutation({
    mutationFn: (id: number) => studentApi.deleteDocument(getToken(), id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); toast.success('Deleted') },
    onError: (e: any) => toast.error(e.message),
  })

  async function download(id: number, name: string) {
    try {
      const { url } = await studentApi.documentDownload(getToken(), id)
      const a = document.createElement('a'); a.href = url; a.download = name; a.click()
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <>
      <Header isLoggedIn />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-xl font-bold mb-1">Documents</h1>
        <p className="text-slate-500 text-sm mb-6">Upload your marksheets and ID proofs. Stored securely per DPDP Act 2023.</p>

        {/* Upload */}
        <div className="bg-white border rounded-xl p-5 mb-5">
          <h2 className="font-semibold text-sm mb-3">Upload New Document</h2>
          <div className="flex gap-3">
            <select value={type} onChange={e => setType(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm">
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label className={`flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" />{uploading ? 'Uploading…' : 'Choose File'}
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={upload} />
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-2">PDF, JPG, PNG, WebP · max 5 MB</p>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500 text-sm">Loading…</div>
        ) : docs?.data.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <div className="font-medium">No documents uploaded yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {docs?.data.map(doc => (
              <div key={doc.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{DOC_TYPES.find(t => t.value === doc.type)?.label ?? doc.type}</div>
                    <div className="text-xs text-slate-400">{doc.original_filename} · {(doc.size_bytes / 1024).toFixed(0)} KB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => download(doc.id, doc.original_filename)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMut.mutate(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
