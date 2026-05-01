'use client'

import { Download, FileText } from 'lucide-react'

interface Props {
  letterPath: string | null
  collegeName: string
}

export default function AdmissionLetterCard({ letterPath, collegeName }: Props) {
  if (!letterPath) return null

  return (
    <a href={letterPath} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3 hover:bg-success/15 transition-colors">
      <FileText className="w-5 h-5 text-success shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-heading">Admission Letter</div>
        <div className="text-xs text-muted truncate">{collegeName}</div>
      </div>
      <Download className="w-4 h-4 text-success shrink-0" />
    </a>
  )
}
