'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react'
import { studentApi } from '@/lib/api'

interface Props {
  applicationId: number
  token: string
}

export default function AdmissionLetterCard({ applicationId, token }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentApi.downloadLetter(token, applicationId)
      if (result.url) {
        // S3/R2 signed URL — open in new tab
        window.open(result.url, '_blank', 'noopener,noreferrer')
        setDone(true)
        setTimeout(() => setDone(false), 3000)
      } else {
        setError('Download not available yet.')
      }
    } catch {
      setError('Could not fetch download link. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm">🎉 Admission Letter Ready</h3>
            <p className="text-emerald-700 text-xs mt-0.5">
              Congratulations! Your admission letter is available for download.
            </p>
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : done ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {loading ? 'Loading…' : done ? 'Opened!' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}
