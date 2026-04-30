'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase'

// ── LOGIN ─────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ── REGISTER ──────────────────────────────────────────────────────────────
export async function register(payload: {
  name: string
  email: string
  phone: string
  password: string
  dob?: string
  consents: {
    application: boolean
    communication: boolean
    marketing: boolean
    analytics: boolean
  }
  policy_version: string
}) {
  const supabase = await createServerSupabaseClient()
  const admin    = createAdminSupabaseClient()

  // 1. Create auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { name: payload.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (signUpError || !authData.user) {
    return { error: signUpError?.message ?? 'Registration failed' }
  }

  const uid = authData.user.id

  // 2. Update profile (trigger already created the row)
  const phone = payload.phone.replace(/\D/g, '').slice(-10)
  await admin.from('profiles').update({
    name:               payload.name,
    phone,
    dob:                payload.dob || null,
    is_minor:           payload.dob
                          ? new Date().getFullYear() - new Date(payload.dob).getFullYear() < 18
                          : false,
    consent_at:         new Date().toISOString(),
    policy_version:     payload.policy_version,
    role:               'student',
  }).eq('id', uid)

  // 3. Write consent ledger (DPDP Act §6)
  const purposeMap = {
    application:    payload.consents.application,
    communication:  payload.consents.communication,
    marketing:      payload.consents.marketing,
    analytics:      payload.consents.analytics,
  }
  const consentRows = Object.entries(purposeMap).map(([purpose, granted]) => ({
    user_id:        uid,
    purpose,
    action:         granted ? 'granted' : 'withdrawn',
    policy_version: payload.policy_version,
    source:         'registration',
  }))
  await admin.from('consent_records').insert(consentRows)

  return { success: true, userId: uid }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ── GET CURRENT USER + PROFILE ────────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .is('deleted_at', null)
    .single()

  return profile ? { ...user, profile } : null
}

// ── UPDATE PROFILE ────────────────────────────────────────────────────────
export async function updateProfile(updates: {
  name?: string
  father_name?: string
  dob?: string
  address?: string
  city?: string
  pincode?: string
  state_id?: number
  category?: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/profile')
  return { success: true }
}

// ── UPLOAD DOCUMENT (to Supabase Storage) ────────────────────────────────
export async function uploadDocument(
  file: File,
  type: 'marksheet_10' | 'marksheet_12' | 'graduation_final' | 'id_proof' | 'photo',
): Promise<{ path?: string; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const ext  = file.name.split('.').pop()
  const path = `${user.id}/${type}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('student-documents')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  // Store document record
  const arrayBuf = await file.arrayBuffer()
  const hashBuf  = await crypto.subtle.digest('SHA-256', arrayBuf)
  const hash     = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('')

  await supabase.from('documents').insert({
    user_id:           user.id,
    type,
    path,
    original_filename: file.name,
    mime_type:         file.type,
    size_bytes:        file.size,
    sha256_hash:       hash,
  })

  return { path }
}
