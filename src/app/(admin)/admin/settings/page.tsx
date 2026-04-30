'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, ChevronDown, ChevronRight } from 'lucide-react'

const GROUP_LABELS: Record<string, string> = {
  seo:          '🔍 SEO & Meta',
  hero:         '🏠 Homepage Hero',
  stats:        '📊 Stats Bar',
  value:        '💡 Value Proposition',
  how_it_works: '📋 How It Works',
  faq:          '❓ FAQ',
  about:        '🏢 About Page',
  footer:       '🔗 Footer',
  contact:      '📞 Contact',
}

export default function AdminSettings() {
  const sb = createBrowserSupabaseClient()
  const [contents, setContents] = useState<any[]>([])
  const [changed,  setChanged]  = useState<Record<string, string>>({})
  const [saving,   setSaving]   = useState(false)
  const [open,     setOpen]     = useState<Record<string, boolean>>({ hero: true })

  useEffect(() => {
    sb.from('site_contents').select('*').order('group_name').order('sort_order')
      .then(({ data }) => setContents(data ?? []))
  }, [])

  function update(key: string, value: string) {
    setChanged(p => ({ ...p, [key]: value }))
  }

  function getValue(item: any): string {
    return changed[item.key] !== undefined ? changed[item.key] : (item.value ?? '')
  }

  async function saveAll() {
    if (!Object.keys(changed).length) { toast.info('No changes'); return }
    setSaving(true)
    try {
      const updates = Object.entries(changed).map(([key, value]) =>
        sb.from('site_contents').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
      )
      await Promise.all(updates)
      setContents(p => p.map(item => changed[item.key] !== undefined ? { ...item, value: changed[item.key] } : item))
      setChanged({})
      toast.success(`${Object.keys(changed).length} changes saved!`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  // Group contents
  const grouped: Record<string, any[]> = {}
  contents.forEach(item => {
    if (!grouped[item.group_name]) grouped[item.group_name] = []
    grouped[item.group_name].push(item)
  })

  const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-colors'

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Content</h1>
          <p className="text-white/30 text-sm mt-0.5">Every text visible on the website — edit here, save once</p>
        </div>
        <button onClick={saveAll} disabled={saving || !Object.keys(changed).length}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : Object.keys(changed).length ? `Save ${Object.keys(changed).length} changes` : 'No changes'}
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(GROUP_LABELS).map(([group, label]) => {
          const items = grouped[group] ?? []
          if (!items.length) return null
          const isOpen = open[group]

          return (
            <div key={group} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              {/* Group header */}
              <button type="button" onClick={() => setOpen(p => ({ ...p, [group]: !isOpen }))}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white text-sm">{label}</span>
                  <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full">{items.length} fields</span>
                  {items.some(i => changed[i.key] !== undefined) && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">● unsaved</span>
                  )}
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
              </button>

              {/* Fields */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                  {items.map(item => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{item.label}</label>
                        <span className="text-[9px] text-white/20 font-mono">{item.key}</span>
                      </div>
                      {item.type === 'text' ? (
                        <input
                          value={getValue(item)}
                          onChange={e => update(item.key, e.target.value)}
                          className={inp + (changed[item.key] !== undefined ? ' border-blue-500/40' : '')}
                        />
                      ) : item.type === 'url' || item.type === 'image_url' ? (
                        <input
                          type="url"
                          value={getValue(item)}
                          onChange={e => update(item.key, e.target.value)}
                          placeholder="https://..."
                          className={inp + (changed[item.key] !== undefined ? ' border-blue-500/40' : '')}
                        />
                      ) : (
                        <textarea
                          value={getValue(item)}
                          onChange={e => update(item.key, e.target.value)}
                          rows={item.type === 'html' ? 8 : 3}
                          className={inp + ' resize-none' + (item.type === 'html' ? ' font-mono text-xs leading-relaxed' : '') + (changed[item.key] !== undefined ? ' border-blue-500/40' : '')}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky save on bottom for mobile */}
      {Object.keys(changed).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={saveAll} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 shadow-2xl text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-50 hover:bg-blue-500">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : `Save ${Object.keys(changed).length} changes`}
          </button>
        </div>
      )}
    </div>
  )
}
