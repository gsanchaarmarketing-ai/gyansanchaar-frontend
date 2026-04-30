'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

const CATEGORIES = ['admission_news','exam_updates','career_guidance','college_reviews','scholarships','study_abroad','current_affairs']

export default function ArticleEditor({ article }: { article?: any }) {
  const router  = useRouter()
  const sb      = createBrowserSupabaseClient()
  const isNew   = !article?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title:            article?.title            ?? '',
    slug:             article?.slug             ?? '',
    category:         article?.category         ?? 'admission_news',
    excerpt:          article?.excerpt          ?? '',
    body:             article?.body             ?? '',
    featured_image:   article?.featured_image   ?? '',
    status:           article?.status           ?? 'draft',
    meta_title:       article?.meta_title       ?? '',
    meta_description: article?.meta_description ?? '',
  })

  function f(k: string) { return (e: any) => setForm(p => ({ ...p, [k]: e.target.value })) }

  async function save() {
    if (!form.title) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const payload = { ...form, slug, updated_at: new Date().toISOString(), published_at: form.status === 'published' ? new Date().toISOString() : null }
      if (isNew) {
        const { data, error } = await sb.from('articles').insert(payload).select('id').single()
        if (error) throw error
        toast.success('Article created!')
        router.push(`/admin/articles/${data.id}`)
      } else {
        const { error } = await sb.from('articles').update(payload).eq('id', article.id)
        if (error) throw error
        toast.success('Saved!')
        router.refresh()
      }
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'
  const lbl = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/articles" className="text-white/30 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="text-2xl font-bold text-white">{isNew ? 'New Article' : 'Edit Article'}</h1>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><label className={lbl}>Title *</label><input value={form.title} onChange={f('title')} className={inp} placeholder="Article title" /></div>
          <div><label className={lbl}>Status</label>
            <select value={form.status} onChange={f('status')} className={inp}>
              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
            </select>
          </div>
          <div><label className={lbl}>Category</label>
            <select value={form.category} onChange={f('category')} className={inp}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className={lbl}>Slug</label><input value={form.slug} onChange={f('slug')} className={inp} placeholder="auto-generated" /></div>
          <div className="col-span-3">
            <CloudinaryUpload
              label="Featured Image"
              value={form.featured_image}
              onChange={v => setForm(p => ({ ...p, featured_image: v }))}
              folder="articles"
              aspect="landscape"
              hint="1200×630px recommended for social sharing"
            />
          </div>
          <div className="col-span-3"><label className={lbl}>Excerpt (shown on cards)</label><textarea value={form.excerpt} onChange={f('excerpt')} rows={2} className={inp+' resize-none'} /></div>
        </div>
        <div><label className={lbl}>Body Content (HTML supported)</label>
          <textarea value={form.body} onChange={f('body')} rows={20} className={inp+' resize-none font-mono text-xs leading-relaxed'} placeholder="<h2>Introduction</h2><p>..." />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/8">
          <div><label className={lbl}>SEO Title (max 70 chars)</label><input value={form.meta_title} onChange={f('meta_title')} className={inp} maxLength={70} /></div>
          <div><label className={lbl}>SEO Description (max 160 chars)</label><input value={form.meta_description} onChange={f('meta_description')} className={inp} maxLength={160} /></div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/8">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : isNew ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
