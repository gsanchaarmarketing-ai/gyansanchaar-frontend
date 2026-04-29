/**
 * Supabase Storage helpers for GyanSanchaar
 *
 * Buckets:
 *   college-assets      — logos, banners, gallery images (public read)
 *   student-documents   — marksheets, ID proofs (private, RLS)
 *   media-logos         — press/media partner logos (public read)
 */

import { createBrowserSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase'

const supabase = createBrowserSupabaseClient()

// ── PUBLIC COLLEGE LOGO UPLOAD (admin only) ───────────────────────────────
export async function uploadCollegeLogo(
  collegeId: number,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const ext  = file.name.split('.').pop()
  const path = `colleges/${collegeId}/logo.${ext}`

  const { error } = await supabase.storage
    .from('college-assets')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from('college-assets').getPublicUrl(path)
  return { url: data.publicUrl }
}

// ── GET PUBLIC URL FOR COLLEGE ASSET ─────────────────────────────────────
export function getCollegeAssetUrl(path: string): string {
  const { data } = supabase.storage.from('college-assets').getPublicUrl(path)
  return data.publicUrl
}

// ── SIGNED URL FOR STUDENT DOCUMENT (server-only, admin) ─────────────────
export async function getSignedDocumentUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.storage
    .from('student-documents')
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('getSignedDocumentUrl error:', error.message)
    return null
  }
  return data.signedUrl
}

// ── UPLOAD STUDENT DOCUMENT (browser) ────────────────────────────────────
export async function uploadStudentDocument(
  userId: string,
  type: string,
  file: File,
): Promise<{ path?: string; url?: string; error?: string }> {
  const ext  = file.name.split('.').pop()
  const path = `${userId}/${type}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('student-documents')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) return { error: error.message }

  // Return a short-lived signed URL for immediate preview
  const { data: signed } = await supabase.storage
    .from('student-documents')
    .createSignedUrl(path, 3600)

  return { path, url: signed?.signedUrl }
}

// ── DELETE FILE ───────────────────────────────────────────────────────────
export async function deleteStorageFile(
  bucket: 'college-assets' | 'student-documents' | 'media-logos',
  path: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) return { error: error.message }
  return {}
}
