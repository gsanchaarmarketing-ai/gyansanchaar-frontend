import type { MetadataRoute } from 'next'
import { publicApi } from '@/lib/api'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/colleges`,            lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/courses`,             lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/exams`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/articles`,            lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/counsellors`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/grievance`,           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/about`,               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,             lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,               lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/refund`,              lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/grievance-policy`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const dynamic: MetadataRoute.Sitemap[] = await Promise.allSettled([
    // Colleges
    publicApi.colleges({ per_page: '200' }).then(r =>
      r.data.map(c => ({
        url: `${BASE}/colleges/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }))
    ),
    // Courses
    publicApi.courses({ per_page: '200' }).then(r =>
      r.data.map(c => ({
        url: `${BASE}/courses/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }))
    ),
    // Articles
    publicApi.articles({ per_page: '200' }).then(r =>
      r.data.map(a => ({
        url: `${BASE}/articles/${a.slug}`,
        lastModified: a.published_at ? new Date(a.published_at) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),
    // Exams
    publicApi.exams().then(r =>
      r.data.map(e => ({
        url: `${BASE}/exams/${e.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }))
    ),
  ]).then(results =>
    results
      .filter((r): r is PromiseFulfilledResult<MetadataRoute.Sitemap> => r.status === 'fulfilled')
      .map(r => r.value)
  )

  return [...staticRoutes, ...dynamic.flat()]
}
