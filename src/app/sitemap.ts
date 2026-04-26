import type { MetadataRoute } from 'next'
import { publicApi } from '@/lib/api'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/colleges`,         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/courses`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/exams`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/articles`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/search`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/grievance`,        lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,            lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/refund`,           lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/grievance-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    // /counsellors removed — counsellors are now college-specific
  ]

  const dynamic: MetadataRoute.Sitemap = []

  try {
    const colleges = await publicApi.colleges({ per_page: '500' })
    colleges.data.forEach(c => dynamic.push({
      url: `${BASE}/colleges/${c.slug}`,
      lastModified: (c as any).updated_at ? new Date((c as any).updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }))
  } catch {}

  try {
    const courses = await publicApi.courses({ per_page: '500' })
    courses.data.forEach(c => dynamic.push({
      url: `${BASE}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }))
  } catch {}

  try {
    const articles = await publicApi.articles({ per_page: '500' })
    articles.data.forEach(a => dynamic.push({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: (a as any).updated_at ? new Date((a as any).updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch {}

  try {
    const exams = await publicApi.exams()
    exams.data.forEach(e => dynamic.push({
      url: `${BASE}/exams/${e.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }))
  } catch {}

  return [...staticRoutes, ...dynamic]
}
