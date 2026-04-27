'use client'

import { useEffect, useRef, useState } from 'react'

interface MediaLogo {
  id: number
  name: string
  logo_url: string
  website_url: string | null
}

export default function MediaMarquee({ logos }: { logos: MediaLogo[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  // Need at least 2 sets to loop seamlessly
  const items = logos.length > 0 ? [...logos, ...logos, ...logos] : []

  if (logos.length === 0) return null

  return (
    <div className="w-full overflow-hidden select-none"
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}
         onTouchStart={() => setPaused(true)}
         onTouchEnd={() => setPaused(false)}>
      <div
        ref={trackRef}
        className="flex items-center gap-8"
        style={{
          animation: `marquee ${logos.length * 3}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          width: 'max-content',
        }}
      >
        {items.map((logo, i) => (
          <LogoItem key={`${logo.id}-${i}`} logo={logo} />
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}

function LogoItem({ logo }: { logo: MediaLogo }) {
  const inner = (
    <div className="h-10 flex items-center justify-center px-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all flex-shrink-0">
      <img
        src={logo.logo_url}
        alt={logo.name}
        className="max-h-7 max-w-[100px] object-contain"
        onError={e => {
          // Fallback to text if image fails
          const el = e.currentTarget.parentElement!
          e.currentTarget.style.display = 'none'
          if (!el.querySelector('span')) {
            const span = document.createElement('span')
            span.className = 'text-xs font-bold text-slate-600 whitespace-nowrap'
            span.textContent = logo.name
            el.appendChild(span)
          }
        }}
      />
    </div>
  )

  if (logo.website_url) {
    return (
      <a href={logo.website_url} target="_blank" rel="noopener noreferrer" aria-label={logo.name}>
        {inner}
      </a>
    )
  }
  return inner
}
