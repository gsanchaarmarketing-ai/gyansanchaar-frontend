/**
 * GyanSanchaar — Supabase Student API
 * Replaces all Laravel /api/v1/student/* calls.
 * Used by client components in dashboard, auth pages, forms.
 */

import { createBrowserSupabaseClient } from '@/lib/supabase'

function sb() { return createBrowserSupabaseClient() }

// ── AUTH ──────────────────────────────────────────────────────────────────

export async function register(payload: {
  name: string
  email: string
  phone: string
  password: string
  dob?: string
  policy_version: string
}) {
  const client = sb()
  const phone = payload.phone.replace(/\D/g, '').slice(-10)

  const { data, error } = await client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { name: payload.name } },
  })
  if (error) throw new Error(error.message)

  const uid = data.user!.id
  const isMinor = payload.dob
    ? (new Date().getFullYear() - new Date(payload.dob).getFullYear()) < 18
    : false

  // Update profile
  await client.from('profiles').update({
    name: payload.name, phone,
    dob: payload.dob || null, is_minor: isMinor,
    consent_at: new Date().toISOString(),
    policy_version: payload.policy_version,
  }).eq('id', uid)

  // Seed consent records
  await client.from('consent_records').insert([
    { user_id: uid, purpose: 'application',   action: 'granted', policy_version: payload.policy_version, source: 'registration' },
    { user_id: uid, purpose: 'communication', action: 'granted', policy_version: payload.policy_version, source: 'registration' },
    { user_id: uid, purpose: 'marketing',     action: 'withdrawn', policy_version: payload.policy_version, source: 'registration' },
    { user_id: uid, purpose: 'analytics',     action: 'granted', policy_version: payload.policy_version, source: 'registration' },
  ])

  return { user: data.user, session: data.session }
}

export async function login(email: string, password: string) {
  const { data, error } = await sb().auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

export async function logout() {
  const { error } = await sb().auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession() {
  const { data: { session } } = await sb().auth.getSession()
  return session
}

// ── PROFILE ───────────────────────────────────────────────────────────────

export async function getProfile() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return { ...profile, email: user.email }
}

export async function updateProfile(updates: {
  name?: string
  father_name?: string
  dob?: string
  address?: string
  city?: string
  pincode?: string
  state_id?: number
  alt_phone?: string
  category?: string
}) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Recompute minor flag if dob changes
  const extra: any = {}
  if (updates.dob) {
    extra.is_minor = (new Date().getFullYear() - new Date(updates.dob).getFullYear()) < 18
  }

  const { error } = await client.from('profiles')
    .update({ ...updates, ...extra, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

// ── PHONE OTP VERIFICATION ────────────────────────────────────────────────

export async function sendPhoneOtp(phone: string) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Store OTP token in our table
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const { error } = await client.from('otp_tokens').insert({
    identifier: phone,
    type:       'phone',
    purpose:    'phone_verification',
    channel:    'whatsapp',
    code_hash:  code, // In prod: hash this. For now stored plain for edge fn to read
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
  if (error) throw new Error(error.message)

  // Call edge function to send WhatsApp/SMS
  await client.functions.invoke('send-otp-whatsapp', {
    body: { phone, otp: code, purpose: 'phone_verification' },
  }).catch(() => {}) // Non-blocking

  return { sent: true }
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: token } = await client
    .from('otp_tokens')
    .select('*')
    .eq('identifier', phone)
    .eq('purpose', 'phone_verification')
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (!token) throw new Error('OTP expired or not found')
  if (token.code_hash !== code) throw new Error('Invalid OTP')

  // Mark verified
  await client.from('otp_tokens').update({ verified_at: new Date().toISOString() }).eq('id', token.id)
  await client.from('profiles').update({ phone_verified_at: new Date().toISOString() }).eq('id', user.id)

  return { verified: true }
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────

export async function getApplications() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await client
    .from('applications')
    .select(`
      id, status, branch, interview_at, admission_letter_path, created_at, updated_at,
      colleges(id, name, slug, city, logo_path, states(name)),
      courses(id, name, level, duration_months),
      application_status_histories(id, from_status, to_status, created_at, note)
    `)
    .eq('student_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function applyToCollege(payload: {
  college_id: number
  course_id: number
  branch?: string
}) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check profile completeness
  const { data: profile } = await client.from('profiles').select('father_name, address, phone_verified_at').eq('id', user.id).single()
  if (!profile?.father_name) throw new Error("Complete your profile (father's name) before applying.")
  if (!profile?.address)     throw new Error('Complete your profile (address) before applying.')
  if (!profile?.phone_verified_at) throw new Error('Verify your phone number before applying.')

  const { data, error } = await client
    .from('applications')
    .insert({ student_id: user.id, ...payload, status: 'applied' })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('You have already applied to this college for this course.')
    throw new Error(error.message)
  }

  // Status history
  await client.from('application_status_histories').insert({
    application_id: data.id,
    to_status: 'applied',
    note: 'Application submitted by student',
  })

  return data
}

export async function withdrawApplication(id: number) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await client
    .from('applications')
    .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('student_id', user.id)

  if (error) throw new Error(error.message)
}

export async function scheduleInterview(applicationId: number, interview_at: string) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await client.from('applications')
    .update({ interview_at, status: 'interview_scheduled', updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('student_id', user.id)

  if (error) throw new Error(error.message)
}

// ── DOCUMENTS ─────────────────────────────────────────────────────────────

export async function getDocuments() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function uploadDocument(file: File, type: string) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upload to Cloudinary via unsigned preset
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'gyansanchaar_unsigned'

  if (!cloudName) throw new Error('Cloudinary not configured')

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)
  fd.append('folder', `gyansanchaar/students/${user.id}/documents`)

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)

  const { data, error } = await client.from('documents').insert({
    user_id: user.id, type,
    path: json.secure_url,
    original_filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    sha256_hash: json.etag ?? '0'.repeat(64),
  }).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteDocument(id: number) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await client.from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────

export async function getNotifications() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function markNotificationRead(id: string) {
  const client = sb()
  await client.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
}

// ── CONSENT (DPDP Act) ────────────────────────────────────────────────────

export async function getConsentState() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data } = await client
    .from('consent_records')
    .select('purpose, action, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Latest action per purpose
  const state: Record<string, boolean> = {}
  const seen = new Set<string>()
  for (const r of (data ?? [])) {
    if (!seen.has(r.purpose)) {
      state[r.purpose] = r.action === 'granted'
      seen.add(r.purpose)
    }
  }
  return state
}

export async function updateConsent(purpose: string, granted: boolean) {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await client.from('consent_records').insert({
    user_id: user.id, purpose,
    action: granted ? 'granted' : 'withdrawn',
    policy_version: '1.0',
    source: 'dashboard',
  })
}

// ── GRIEVANCE ─────────────────────────────────────────────────────────────

export async function fileGrievance(payload: {
  complainant_name: string
  complainant_email: string
  complainant_phone?: string
  category: string
  subject: string
  description: string
}) {
  const client = sb()
  const ticket_id = `GS-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const { data, error } = await client.from('grievances').insert({
    ...payload, ticket_id, status: 'open',
  }).select('ticket_id').single()

  if (error) throw new Error(error.message)
  return { ticket_id: data.ticket_id }
}

export async function getGrievanceStatus(ticket_id: string) {
  const { data } = await sb()
    .from('grievances')
    .select('ticket_id, status, category, subject, created_at, resolved_at, resolution_note')
    .eq('ticket_id', ticket_id)
    .single()
  return data
}

// ── DATA ERASURE (DPDP §12) ───────────────────────────────────────────────

export async function requestErasure() {
  const client = sb()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ticket_id = `ERASE-${Date.now()}`
  const { data: profile } = await client.from('profiles').select('name').eq('id', user.id).single()

  await client.from('grievances').insert({
    ticket_id,
    complainant_name:  profile?.name ?? 'Student',
    complainant_email: user.email ?? '',
    category:          'data_erasure',
    subject:           'Data Erasure Request under DPDP Act 2023 §12',
    description:       `Student ${user.id} requests complete erasure of all personal data per DPDP Act 2023 Section 12.`,
    status:            'open',
    user_id:           user.id,
  })

  return { ticket_id }
}
