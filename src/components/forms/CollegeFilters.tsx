'use client'

import { useRouter } from 'next/navigation'
import type { State, Stream } from '@/lib/api'

interface Props { states: State[]; streams: Stream[]; current: Record<string,string> }

export default function CollegeFilters({ states, streams, current }: Props) {
  const router = useRouter()

  function update(key: string, value: string) {
    const p = new URLSearchParams(current)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    router.push(`/colleges?${p}`)
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-5 text-sm">
      <div>
        <label className="block font-semibold mb-2 text-slate-700">State</label>
        <select className="w-full border rounded-lg px-3 py-2 text-sm"
          value={current.state_id ?? ''} onChange={e => update('state_id', e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2 text-slate-700">Type</label>
        {['government','private','deemed','autonomous'].map(t => (
          <label key={t} className="flex items-center gap-2 mb-1 cursor-pointer">
            <input type="radio" name="type" value={t} checked={current.type === t}
              onChange={() => update('type', t)} />
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer text-slate-500">
          <input type="radio" name="type" value="" checked={!current.type}
            onChange={() => update('type', '')} />
          All types
        </label>
      </div>

      <div>
        <label className="block font-semibold mb-2 text-slate-700">Stream</label>
        <select className="w-full border rounded-lg px-3 py-2 text-sm"
          value={current.stream ?? ''} onChange={e => update('stream', e.target.value)}>
          <option value="">All Streams</option>
          {streams.map(s => <option key={s.id} value={s.slug}>{s.short}</option>)}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2 text-slate-700">Sort</label>
        <select className="w-full border rounded-lg px-3 py-2 text-sm"
          value={current.sort ?? 'nirf'} onChange={e => update('sort', e.target.value)}>
          <option value="nirf">NIRF Rank</option>
          <option value="name">Name A–Z</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  )
}
