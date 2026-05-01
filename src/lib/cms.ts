/**
 * CMS content fetcher — reads from Supabase site_contents.
 * Falls back to empty strings if Supabase is unavailable (build time).
 */

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function getCmsContent(group?: string): Promise<Record<string, string>> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return {}
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
    let q = sb.from('site_contents').select('key,value')
    if (group) q = q.eq('group_name', group)
    const { data } = await q
    if (!data) return {}
    return Object.fromEntries(data.map((r: any) => [r.key, r.value ?? '']))
  } catch {
    return {}
  }
}

export function c(content: Record<string, string>, key: string, fallback = ''): string {
  return content[key] ?? fallback
}
