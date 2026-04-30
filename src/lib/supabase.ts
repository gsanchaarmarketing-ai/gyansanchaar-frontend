/**
 * Supabase client utilities.
 *
 * ⚠️  SERVER components: import from '@/lib/supabase-server'
 *     CLIENT components: import from '@/lib/supabase'
 */

import { createBrowserClient } from '@supabase/ssr'
import { createClient }        from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── BROWSER (use client) ──────────────────────────────────────────────────
export function createBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON)
}

// ── ADMIN (server-only — bypasses RLS) ────────────────────────────────────
export function createAdminSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Types ─────────────────────────────────────────────────────────────────
export type UserRole =
  | 'student' | 'admin' | 'super_admin'
  | 'grievance_officer' | 'dpo' | 'counsellor'

export interface Profile {
  id: string; name: string; phone: string | null
  phone_verified_at: string | null; dob: string | null
  is_minor: boolean; address: string | null; state_id: number | null
  city: string | null; role: UserRole; consent_at: string | null
  parental_consent_verified: boolean; created_at: string
}
