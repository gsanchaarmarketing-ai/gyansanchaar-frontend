/**
 * Cloudinary image upload helpers for GyanSanchaar.
 * Used in admin panel for college logos, gallery images, media logos.
 * Videos → YouTube URL stored as text (no upload needed).
 *
 * Required env vars (add to Vercel):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  = your cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = gyansanchaar_unsigned  (create in Cloudinary settings)
 *   CLOUDINARY_API_KEY    = from Cloudinary dashboard (server-only)
 *   CLOUDINARY_API_SECRET = from Cloudinary dashboard (server-only)
 */

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'gyansanchaar_unsigned'

// ── BROWSER UPLOAD (unsigned — admin panel) ───────────────────────────────
export async function uploadToCloudinary(
  file: File,
  folder: 'colleges/logos' | 'colleges/gallery' | 'media-logos' | 'courses' | 'articles' | 'team',
): Promise<{ ok: true; url: string; publicId: string } | { ok: false; error: string }> {
  if (!CLOUD_NAME) return { ok: false, error: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set' }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', `gyansanchaar/${folder}`)
  fd.append('quality', 'auto')
  fd.append('fetch_format', 'auto')

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body:   fd,
    })
    const data = await res.json()
    if (data.error) return { ok: false, error: data.error.message }
    return { ok: true, url: data.secure_url, publicId: data.public_id }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// ── TRANSFORM URL (resize, crop on-the-fly) ───────────────────────────────
export function cloudinaryUrl(
  url: string,
  opts: { w?: number; h?: number; crop?: string; quality?: string } = {},
): string {
  if (!url?.includes('cloudinary.com')) return url
  // Insert transformation between /upload/ and the public ID
  const { w, h, crop = 'fill', quality = 'auto' } = opts
  const transforms = [
    w    ? `w_${w}`   : '',
    h    ? `h_${h}`   : '',
    `c_${crop}`,
    `q_${quality}`,
    'f_auto',
  ].filter(Boolean).join(',')

  return url.replace('/upload/', `/upload/${transforms}/`)
}

// ── YOUTUBE EMBED URL helper ──────────────────────────────────────────────
export function youtubeEmbedUrl(url: string): string | null {
  if (!url) return null
  // Handle: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (!match) return null
  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
}

export function youtubeThumbnail(url: string): string | null {
  const embed = youtubeEmbedUrl(url)
  if (!embed) return null
  const id = embed.split('/embed/')[1]?.split('?')[0]
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}
