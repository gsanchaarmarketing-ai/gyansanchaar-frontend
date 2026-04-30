'use client'

import { useState, useRef } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (url: string) => void
  folder: 'colleges/logos' | 'colleges/gallery' | 'media-logos' | 'courses' | 'articles' | 'team'
  label?: string
  hint?: string
  aspect?: 'square' | 'landscape' | 'logo'
}

export default function CloudinaryUpload({ value, onChange, folder, label, hint, aspect = 'landscape' }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const previewClass = {
    square:    'h-24 w-24',
    logo:      'h-16 w-40',
    landscape: 'h-32 w-full',
  }[aspect]

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Images only (JPG, PNG, WebP)'); return }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Max 5MB per image'); return }

    setUploading(true)
    const result = await uploadToCloudinary(file, folder)
    setUploading(false)

    if (!result.ok) { toast.error(`Upload failed: ${result.error}`); return }
    onChange(result.url)
    toast.success('Uploaded!')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{label}</div>}

      {/* Preview + upload zone */}
      <div
        className={`relative border-2 border-dashed border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20 cursor-pointer ${previewClass}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-contain bg-white/5 p-2" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-6 h-6 text-white/20" />
            <span className="text-[10px] text-white/30">Click or drag to upload</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Upload overlay on hover */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">Change image</span>
          </div>
        )}
      </div>

      {/* URL input + clear */}
      <div className="flex gap-2 mt-2">
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste Cloudinary / image URL"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors"
        />
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="p-2 rounded-xl hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {hint && <div className="text-[10px] text-white/20 mt-1">{hint}</div>}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}
