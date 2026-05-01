'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, ExternalLink, Quote } from 'lucide-react'

interface Review {
  author:    string
  avatar:    string | null
  rating:    number
  text:      string
  time:      string
  timestamp: number
}

interface Props {
  placeId:     string
  collegeName: string
  // Pre-fetched from DB (no extra round-trip if already cached)
  cachedRating?: number | null
  cachedCount?:  number | null
  mapsUrl?:      string | null
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i}
          className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'}`}
        />
      ))}
    </div>
  )
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) return (
    <img src={src} alt={name} referrerPolicy="no-referrer"
      className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
  )
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white flex items-center justify-center text-white font-bold text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function GoogleReviewsCarousel({ placeId, collegeName, cachedRating, cachedCount, mapsUrl }: Props) {
  const [reviews,  setReviews]  = useState<Review[]>([])
  const [rating,   setRating]   = useState(cachedRating ?? null)
  const [total,    setTotal]    = useState(cachedCount  ?? null)
  const [googleUrl,setGoogleUrl]= useState(mapsUrl ?? null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  // Auto-scroll
  const trackRef   = useRef<HTMLDivElement>(null)
  const pausedRef  = useRef(false)
  const frameRef   = useRef<number>()
  const posRef     = useRef(0)

  useEffect(() => {
    fetch(`/api/reviews/${placeId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(true); return }
        setReviews(data.reviews ?? [])
        setRating(data.rating)
        setTotal(data.total_ratings)
        setGoogleUrl(data.maps_url)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [placeId])

  // Smooth auto-scroll
  useEffect(() => {
    if (!reviews.length || !trackRef.current) return
    const track = trackRef.current

    function step() {
      if (!pausedRef.current && track) {
        posRef.current += 0.4
        // Reset when first set scrolled out (seamless loop with duplicate)
        const half = track.scrollWidth / 2
        if (posRef.current >= half) posRef.current = 0
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [reviews])

  if (loading) return (
    <div className="py-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
      Loading Google reviews…
    </div>
  )

  if (error || !reviews.length) return null

  // Duplicate reviews for seamless loop
  const doubled = [...reviews, ...reviews]

  return (
    <section className="py-8">
      {/* Section header */}
      <div className="flex items-start justify-between mb-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Google G logo */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-xl font-bold text-slate-800">Student Reviews</h2>
          </div>
          <div className="flex items-center gap-3">
            {rating && (
              <>
                <span className="text-3xl font-black text-slate-800">{rating.toFixed(1)}</span>
                <Stars rating={rating} size="lg" />
                {total && (
                  <span className="text-slate-500 text-sm">({total.toLocaleString('en-IN')} Google reviews)</span>
                )}
              </>
            )}
          </div>
        </div>
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-xl transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            View on Google
          </a>
        )}
      </div>

      {/* Auto-scrolling track */}
      <div className="overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}>
        <div ref={trackRef} className="flex gap-4 w-max" style={{ willChange: 'transform' }}>
          {doubled.map((r, i) => (
            <div key={i}
              className="w-72 flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-blue-100 mb-2" />

              {/* Review text */}
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 mb-4">
                {r.text || 'Great college with excellent faculty and facilities.'}
              </p>

              {/* Stars */}
              <Stars rating={r.rating} />

              {/* Author */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                <Avatar name={r.author} src={r.avatar} />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{r.author}</div>
                  <div className="text-xs text-slate-400">{r.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a review CTA */}
      {googleUrl && (
        <div className="text-center mt-5">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Write a Google Review
          </a>
        </div>
      )}
    </section>
  )
}
