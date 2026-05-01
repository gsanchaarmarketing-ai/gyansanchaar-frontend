import type { College } from '@/types'
import Link from 'next/link'
import { MapPin, Award } from 'lucide-react'

import { cn } from '@/lib/utils'

export default function CollegeCard({ college }: { college: College }) {
  return (
    <Link href={`/colleges/${college.slug}`}
      className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-400 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        {college.logo_path ? (
          <img src={college.logo_path} alt={college.name} className="w-12 h-12 rounded-lg object-contain border" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
            {college.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 line-clamp-2">
            {college.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3 h-3" />
            {college.city}{college.state ? `, ${college.state.name}` : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={cn(
          'px-2 py-0.5 text-xs rounded-full font-medium',
          college.type === 'government' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        )}>
          {college.type.charAt(0).toUpperCase() + college.type.slice(1)}
        </span>
        {college.nirf_rank && (
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <Award className="w-3 h-3" />
            NIRF #{college.nirf_rank}
          </span>
        )}
        {college.naac_grade && (
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            NAAC {college.naac_grade}
          </span>
        )}
      </div>
    </Link>
  )
}
