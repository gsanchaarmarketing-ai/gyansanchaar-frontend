import type { State, Stream } from '@/types'
'use client'

import { useRouter } from 'next/navigation'

interface Props { states: State[]; streams: Stream[]; current: Record<string,string> }

export default function CollegeFilters({ states, streams, current }: Props) {
  const router = useRouter()

  function update(key: string, value: string) {
    const p = new URLSearchParams(current as any)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    router.push(`/colleges?${p}`)
  }

  function clear() { router.push('/colleges') }

  const hasFilters = !!(current.state_id || current.type || current.stream_id || current.q)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="font-bold text-slate-800 text-sm">Filters</h2>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-blue-600 hover:underline font-medium">
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-5 text-sm">
        {/* Search */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Search</label>
          <input
            type="text"
            defaultValue={current.q ?? ''}
            placeholder="College name…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            onKeyDown={e => { if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value) }}
          />
        </div>

        {/* State */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">State</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors bg-white"
            value={current.state_id ?? ''}
            onChange={e => update('state_id', e.target.value)}>
            <option value="">All States</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Type — chip-based like reference */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: '',           label: 'All'        },
              { value: 'government', label: 'Government' },
              { value: 'private',    label: 'Private'    },
              { value: 'deemed',     label: 'Deemed'     },
              { value: 'autonomous', label: 'Autonomous' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('type', value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  (current.type ?? '') === value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stream */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Stream</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors bg-white"
            value={current.stream_id ?? ''}
            onChange={e => update('stream_id', e.target.value)}>
            <option value="">All Streams</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* NAAC filter */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">NAAC Grade</label>
          <div className="flex flex-wrap gap-1.5">
            {['', 'A++', 'A+', 'A', 'B++', 'B+'].map(g => (
              <button key={g}
                onClick={() => update('naac', g)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  (current.naac ?? '') === g
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                }`}>
                {g || 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Sort By</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors bg-white"
            value={current.sort ?? 'nirf'}
            onChange={e => update('sort', e.target.value)}>
            <option value="nirf">NIRF Rank</option>
            <option value="featured">Featured First</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* UGC only toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-700">UGC Verified Only</span>
          <button
            role="switch"
            aria-checked={current.ugc === '1'}
            onClick={() => update('ugc', current.ugc === '1' ? '' : '1')}
            className={`relative w-10 h-5 rounded-full transition-colors ${current.ugc === '1' ? 'bg-blue-600' : 'bg-slate-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${current.ugc === '1' ? 'translate-x-5' : ''}`} />
          </button>
        </label>
      </div>
    </div>
  )
}
