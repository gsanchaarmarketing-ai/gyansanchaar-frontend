/**
 * Supabase client utilities for GyanSanchaar
 * Three clients for three contexts — never mix them.
 *
 * 1. createServerClient  — Server Components, Route Handlers, Server Actions
 * 2. createBrowserClient — Client Components ('use client')
 * 3. createAdminClient   — Server-only, service_role key, bypasses RLS
 */

import { createServerClient as _createServerClient } from '@supabase/ssr'
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ── SERVER CLIENT (Server Components / Route Handlers) ────────────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return _createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll called from a Server Component — safe to ignore
        }
      },
    },
  })
}

// ── BROWSER CLIENT (Client Components) ───────────────────────────────────
export function createBrowserSupabaseClient() {
  return _createBrowserClient(URL, ANON)
}

// ── ADMIN CLIENT (service_role — bypasses RLS, server only) ──────────────
export function createAdminSupabaseClient() {
  if (!SERVICE) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Database types (expand as needed) ────────────────────────────────────
export type UserRole = 'student' | 'admin' | 'super_admin' | 'grievance_officer' | 'dpo' | 'counsellor'

export interface Profile {
  id: string
  name: string
  father_name: string | null
  phone: string | null
  phone_country_code: string
  phone_verified_at: string | null
  dob: string | null
  is_minor: boolean
  address: string | null
  state_id: number | null
  city: string | null
  pincode: string | null
  category: string | null
  role: UserRole
  consent_at: string | null
  policy_version: string | null
  parental_consent_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ApplicationStatus {
  applied: 'applied'
  approved: 'approved'
  interview_scheduled: 'interview_scheduled'
  admitted: 'admitted'
  rejected: 'rejected'
  withdrawn: 'withdrawn'
}
