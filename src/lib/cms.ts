/**
 * CMS content fetcher.
 * Fetches site content from the backend API.
 * Server-side: fetches fresh. Client-side: cached in module scope.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'

let _cache: Record<string, string> | null = null

export async function getCmsContent(group?: string): Promise<Record<string, string>> {
  const url = `${BACKEND}/public/content${group ? `?group=${group}` : ''}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return {}
    const json = await res.json()
    return (json.data ?? {}) as Record<string, string>
  } catch {
    return {}
  }
}

/** Get a single key with fallback. */
export async function cms(key: string, fallback = ''): Promise<string> {
  if (!_cache) _cache = await getCmsContent()
  return _cache[key] ?? fallback
}

/** Synchronous getter for client components (pass pre-fetched content map). */
export function c(content: Record<string, string>, key: string, fallback = ''): string {
  return content[key] ?? fallback
}
