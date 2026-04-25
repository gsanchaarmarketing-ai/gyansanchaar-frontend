// Client-side auth helper — reads httpOnly cookie via server API
// document.cookie cannot read httpOnly cookies, so we call /api/auth/check

let _cached: { token: string | null; authenticated: boolean } | null = null
let _cacheTime = 0
const CACHE_TTL = 30_000 // 30 seconds

export async function getClientToken(): Promise<string | null> {
  // Return cached value if fresh
  if (_cached && Date.now() - _cacheTime < CACHE_TTL) {
    return _cached.token
  }

  try {
    const res = await fetch('/api/auth/check', { cache: 'no-store' })
    const data = await res.json()
    _cached = data
    _cacheTime = Date.now()
    return data.token
  } catch {
    return null
  }
}

export function clearClientAuthCache() {
  _cached = null
  _cacheTime = 0
}
