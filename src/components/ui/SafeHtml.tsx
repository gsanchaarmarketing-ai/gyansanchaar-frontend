'use client'

/**
 * SafeHtml — renders CMS-sourced HTML safely.
 * Uses DOMPurify to strip any injected scripts/event handlers (XSS #05 fix).
 * JSON-LD script tags use JSON.stringify() — safe by construction, no sanitization needed.
 *
 * Install: npm install dompurify @types/dompurify
 */
import { useEffect, useRef } from 'react'

interface Props {
  html: string
  className?: string
}

export default function SafeHtml({ html, className = 'prose prose-slate prose-sm max-w-none' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    import('dompurify').then(({ default: DOMPurify }) => {
      // Config: allow standard content HTML, block scripts/iframes/event handlers
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p','br','strong','em','u','s','h1','h2','h3','h4','h5','h6',
          'ul','ol','li','blockquote','pre','code','a','img',
          'table','thead','tbody','tr','th','td','hr','span','div',
        ],
        ALLOWED_ATTR: ['href','src','alt','title','class','target','rel'],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script','iframe','object','embed','form','input','button'],
        FORBID_ATTR: ['onerror','onload','onclick','onmouseover','style'],
        ADD_ATTR: ['target'],  // allow target="_blank" on links
      })
      // Force rel="noopener noreferrer" on all external links
      const tmp = document.createElement('div')
      tmp.innerHTML = clean
      tmp.querySelectorAll('a[target="_blank"]').forEach(a => {
        a.setAttribute('rel', 'noopener noreferrer')
      })
      if (ref.current) ref.current.innerHTML = tmp.innerHTML
    })
  }, [html])

  // SSR: render nothing (article body is client-rendered after sanitization)
  // SEO: excerpt + meta_description handle indexable text server-side
  return <div ref={ref} className={className} aria-live="polite" />
}
