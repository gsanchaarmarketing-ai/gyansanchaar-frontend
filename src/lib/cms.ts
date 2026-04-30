/**
 * CMS content fetcher — reads from Supabase site_contents table.
 * Replaces the old Laravel /api/v1/public/content endpoint.
 * All editable text lives in Supabase — admins edit at /admin/settings.
 */

import { createServerSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

/** Server-side: fetch all content (or a specific group) from Supabase. */
export async function getCmsContent(group?: string): Promise<Record<string, string>> {
  try {
    // Use public anon client — site_contents is public read
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    let q = sb.from('site_contents').select('key,value')
    if (group) q = q.eq('group_name', group)
    const { data } = await q
    if (!data) return {}
    return Object.fromEntries(data.map((r: any) => [r.key, r.value ?? '']))
  } catch {
    return {}
  }
}

/** Synchronous getter for client components (pass pre-fetched content map). */
export function c(content: Record<string, string>, key: string, fallback = ''): string {
  return content[key] ?? fallback
}

/** Update a single content key (admin only, server action). */
export async function updateCmsKey(key: string, value: string): Promise<void> {
  const sb = await createServerSupabaseClient()
  await sb.from('site_contents')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
}
