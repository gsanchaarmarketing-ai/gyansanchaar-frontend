import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/register',
          '/verify-otp',
          '/parent-consent/',
          '/counsellors',      // removed page — redirect to /colleges
          '/*?*token=',        // query strings with tokens
          '/*?*debug=',
        ],
      },
      // Let AI crawlers in (AEO — AI Engine Optimisation)
      { userAgent: 'GPTBot',      allow: '/' },
      { userAgent: 'ChatGPT-User',allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot',   allow: '/' },
      { userAgent: 'Googlebot',   allow: '/' },
      { userAgent: 'bingbot',     allow: '/' },
      { userAgent: 'Slurp',       allow: '/' }, // Yahoo
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
