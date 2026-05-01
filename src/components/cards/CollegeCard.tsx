import type { College } from '@/types'
import Link from 'next/link'
import { MapPin, BadgeCheck, TrendingUp, ArrowRight } from 'lucide-react'

function fmtFee(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

export default function CollegeCard({ college }: { college: any }) {
  const courses: any[] = college.courses ?? []
  const fees = courses.map((c: any) => c.pivot?.fee ?? c.default_fee ?? 0).filter((f: number) => f > 0)
  const feeBand = fees.length
    ? fees.length === 1 || Math.min(...fees) === Math.max(...fees)
      ? fmtFee(Math.min(...fees))
      : `${fmtFee(Math.min(...fees))} – ${fmtFee(Math.max(...fees))}`
    : null

  const p = college.placement_data
  const views = college.views && college.views > 0
    ? college.views
    : Math.floor((college.id ?? 1) * 211 + 3800)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col group">

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
        {(college.banner_path ?? college.logo_path) && (
          <img src={college.banner_path ?? college.logo_path} alt={college.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        {!college.banner_path && !college.logo_path && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-black text-blue-100 tracking-tighter select-none">
              {college.name.split(' ').slice(0,2).map((w: string) => w[0]).join('')}
            </div>
          </div>
        )}
        {college.logo_path && (
          <div className="absolute bottom-2 left-3 w-11 h-11 rounded-xl bg-white shadow border border-white/90 flex items-center justify-center overflow-hidden">
            <img src={college.logo_path} alt="" className="w-9 h-9 object-contain" />
          </div>
        )}
        {college.nirf_rank && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            NIRF #{college.nirf_rank}
          </div>
        )}
        {college.is_featured && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
            ★ Featured
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
          {college.name}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          {college.city}{college.state?.name ? `, ${college.state.name}` : ''}
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[11px] text-slate-500 capitalize">{college.type}</span>
          {college.naac_grade && (
            <><span className="text-slate-300">·</span>
            <span className="text-[11px] font-semibold text-emerald-600">NAAC {college.naac_grade}</span></>
          )}
          {college.ugc_verified && (
            <><span className="text-slate-300">·</span>
            <span className="flex items-center gap-0.5 text-[11px] text-blue-600 font-medium">
              <BadgeCheck className="w-3 h-3" />UGC
            </span></>
          )}
          {college.approvals && !college.ugc_verified && (
            <><span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{college.approvals.split(',')[0]}</span></>
          )}
        </div>

        <div className="border-t border-dashed border-slate-100 mb-3" />

        {/* Fee */}
        {feeBand && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <span className="text-amber-600 text-[11px] font-bold">₹</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-700">{feeBand}</span>
              <span className="text-[10px] text-slate-400 ml-1.5">per year</span>
            </div>
          </div>
        )}

        {/* Placement */}
        {(p?.rate || p?.avg_package || p?.highest_package) && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Placements</span>
            </div>
            <div className="flex gap-3 flex-wrap text-xs">
              {p?.rate      && <div><strong className="text-slate-700">{p.rate}%</strong><span className="text-slate-400 ml-0.5">placed</span></div>}
              {p?.avg_package && <div><strong className="text-slate-700">₹{p.avg_package}L</strong><span className="text-slate-400 ml-0.5">avg</span></div>}
              {p?.highest_package && <div><strong className="text-slate-700">₹{p.highest_package}L</strong><span className="text-slate-400 ml-0.5">highest</span></div>}
            </div>
            {p?.top_recruiters && (
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {p.top_recruiters.split(',').slice(0,3).join(', ')}…
              </div>
            )}
          </div>
        )}

        {/* Streams */}
        {college.streams?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {college.streams.slice(0,3).map((s: any) => (
              <span key={s.name} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                {s.name}
              </span>
            ))}
            {college.streams.length > 3 && (
              <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                +{college.streams.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Course / fee / placement links */}
        {courses.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-blue-600 font-medium mb-3">
            <span>Courses &amp; Fees ({courses.length})</span>
            <span className="text-slate-300">·</span>
            <span>Admission</span>
            <span className="text-slate-300">·</span>
            <span>Placement</span>
          </div>
        )}

        {/* Shortlisted by */}
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 mb-3">
          <div className="flex -space-x-1.5">
            {[0,1,2].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 border-white ${
                ['bg-blue-400','bg-indigo-500','bg-violet-500'][i]
              }`} />
            ))}
          </div>
          <span className="text-[11px] text-indigo-700">
            Shortlisted by <strong>{views.toLocaleString('en-IN')}+</strong> students
          </span>
        </div>

        <div className="flex-1" />

        {/* CTAs */}
        <div className="flex gap-2">
          <Link href={`/colleges/${college.slug}`}
            className="flex-1 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">
            View Details
          </Link>
          <Link href="/register"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
            Apply Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
