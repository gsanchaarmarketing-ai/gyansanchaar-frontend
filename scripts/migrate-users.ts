#!/usr/bin/env node
/**
 * GyanSanchaar — Laravel → Supabase Auth Migration Script
 *
 * Migrates existing users from MySQL/Laravel into Supabase auth.users
 * preserving their bcrypt passwords (Supabase Auth supports bcrypt natively).
 *
 * Usage:
 *   1. Export users from MySQL:
 *      SELECT id, name, email, password, phone, role, created_at FROM users WHERE deleted_at IS NULL;
 *
 *   2. Save as users.json array
 *
 *   3. Run: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node migrate-users.js
 *
 * Requirements: npm install @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL        = process.env.SUPABASE_URL        ?? 'https://iwgsqaezapwxhjadnfvm.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌  Set SUPABASE_SERVICE_KEY environment variable')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Load users from exported MySQL JSON ───────────────────────────────────
// Expected shape: [{ id, name, email, password (bcrypt hash), phone, role, created_at }, ...]
const users: Array<{
  id: number
  name: string
  email: string
  password: string  // bcrypt hash from Laravel
  phone: string | null
  role: string
  created_at: string
}> = JSON.parse(readFileSync('./users.json', 'utf8'))

console.log(`Found ${users.length} users to migrate`)

let success = 0
let failed  = 0
const errors: string[] = []

for (const user of users) {
  try {
    // Create auth.users entry with the ORIGINAL bcrypt hash
    // Supabase Admin API accepts password_hash directly — no reset needed
    const { data, error } = await admin.auth.admin.createUser({
      email:             user.email,
      email_confirm:     true,
      password:          undefined,  // we'll set the hash below
      user_metadata: {
        name:            user.name,
        migrated_from:   'laravel',
        original_id:     user.id,
      },
    })

    if (error) throw error

    // Directly patch the encrypted_password column in auth.users
    // to preserve the original bcrypt hash
    const { error: patchErr } = await admin.rpc('migrate_user_password', {
      p_user_id:  data.user.id,
      p_hash:     user.password,
    })

    // Fallback: if RPC not available, use direct SQL via execute_sql instead
    if (patchErr) {
      console.warn(`  ⚠️  RPC patch failed for ${user.email}: ${patchErr.message}`)
      console.warn('     Run SQL manually: UPDATE auth.users SET encrypted_password = \'<hash>\' WHERE id = \'<uid>\'')
    }

    // Update profile with extra fields
    await admin.from('profiles').update({
      name:    user.name,
      phone:   user.phone?.replace(/\D/g, '').slice(-10) ?? null,
      role:    user.role,
    }).eq('id', data.user.id)

    console.log(`  ✓  ${user.email} (${user.role})`)
    success++
  } catch (err: any) {
    const msg = `✗  ${user.email}: ${err.message}`
    console.error(`  ${msg}`)
    errors.push(msg)
    failed++
  }

  // Rate limit: 10 users/second to avoid hitting Supabase admin API limits
  await new Promise(r => setTimeout(r, 100))
}

console.log(`\nDone: ${success} migrated, ${failed} failed`)
if (errors.length) {
  console.log('\nFailed users:')
  errors.forEach(e => console.log(' ', e))
}
