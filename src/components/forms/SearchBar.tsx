'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')

  function handle(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) router.push(`/colleges?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form onSubmit={handle} className="flex w-full max-w-xl mx-auto">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search colleges, courses, cities…"
        className="flex-1 px-4 py-3 rounded-l-xl text-slate-900 text-sm outline-none border-0"
        aria-label="Search"
      />
      <button type="submit"
        className="bg-amber-400 hover:bg-amber-500 px-5 rounded-r-xl font-semibold text-slate-900 flex items-center gap-2 transition-colors">
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  )
}
