'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryItem {
  type: 'image' | 'video'
  url: string
  thumb?: string
}

interface Props {
  items: GalleryItem[]
  collegeName: string
}

export default function GalleryCarousel({ items, collegeName }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(0)
  const total = items.length

  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActive(i => (i + 1) % total), [total])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightbox !== null) {
        if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? (i - 1 + total) % total : null)
        if (e.key === 'ArrowRight') setLightbox(i => i !== null ? (i + 1) % total : null)
        if (e.key === 'Escape') setLightbox(null)
      } else {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, total, prev, next])

  // Touch/drag
  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX
    setDragging(true)
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return
    const delta = e.clientX - dragStart.current
    if (delta < -40) next()
    else if (delta > 40) prev()
    setDragging(false)
  }

  // Position each card
  function getStyle(idx: number) {
    const diff = ((idx - active) % total + total) % total
    const normalized = diff > total / 2 ? diff - total : diff
    const abs = Math.abs(normalized)

    if (abs > 2) return { display: 'none' }

    const x = normalized * 200
    const z = 100 - abs * 40
    const scale = 1 - abs * 0.15
    const rotateY = -normalized * 18
    const opacity = abs === 0 ? 1 : abs === 1 ? 0.75 : 0.45
    const blur = abs === 0 ? 0 : abs === 1 ? 0 : 2

    return {
      transform: `translateX(${x}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: z,
      opacity,
      filter: blur ? `blur(${blur}px)` : undefined,
      cursor: abs === 0 ? 'zoom-in' : 'pointer',
    }
  }

  if (items.length === 0) return null

  return (
    <>
      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i - 1 + total) % total : null) }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i + 1) % total : null) }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="max-w-5xl max-h-[90vh] px-20" onClick={e => e.stopPropagation()}>
            {items[lightbox].type === 'video' ? (
              <iframe
                src={items[lightbox].url}
                className="w-full aspect-video rounded-2xl"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <img
                src={items[lightbox].url}
                alt={`${collegeName} campus`}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            )}
          </div>
          <div className="absolute bottom-6 text-white/50 text-sm">
            {(lightbox) + 1} / {total}
          </div>
        </div>
      )}

      {/* Fan Carousel */}
      <div className="relative select-none">
        {/* 3D stage */}
        <div
          className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden"
          style={{ perspective: '1200px' }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {items.map((item, idx) => {
            const style = getStyle(idx)
            if (style.display === 'none') return null
            return (
              <div
                key={idx}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  ...style,
                  width: 'min(320px, 70vw)',
                  transformOrigin: 'center center',
                }}
                onClick={() => {
                  const diff = ((idx - active) % total + total) % total
                  const normalized = diff > total / 2 ? diff - total : diff
                  if (normalized === 0) setLightbox(idx)
                  else setActive(idx)
                }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  {item.type === 'video' ? (
                    <>
                      <img
                        src={item.thumb ?? `https://img.youtube.com/vi/${item.url.split('/').pop()?.split('?')[0]}/hqdefault.jpg`}
                        alt="Campus video"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={`${collegeName} campus`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  )}

                  {/* Sheen on active */}
                  {idx === active && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-border bg-white hover:bg-primary hover:border-primary hover:text-white text-heading flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all ${i === active ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-border bg-white hover:bg-primary hover:border-primary hover:text-white text-heading flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-muted text-xs mt-3">
          Tap to zoom · Drag or swipe to browse
        </p>
      </div>
    </>
  )
}
