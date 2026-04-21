# Bug Fixes — gyan-sanchaar-main
# Apply these to your EXISTING running codebase (not this repo)
# Based on Code Review Report dated 13 Apr 2026

---

## FIX #01 — AnalyticsWrapper outside body
### app/layout.tsx · L90

BEFORE:
```tsx
    </body>
    <AnalyticsWrapper /> {/* WRONG: outside body */}
  </html>
```

AFTER:
```tsx
      <CookieConsent />
      <AnalyticsWrapper /> {/* inside body, before ClientProviders closes */}
    </ClientProviders>
    </body>
  </html>
```

---

## FIX #02 — Hooks before early return
### components/common/Header.tsx · L50–60

BEFORE:
```tsx
const isAuthPage = ...
if (isAuthPage) return null  // early return BEFORE hooks — CRASH

const [open, setOpen] = useState(false)
```

AFTER:
```tsx
// ALL hooks must come first
const [open, setOpen] = useState(false)
const { isAuthenticated } = useAuth()
// ... all other hooks ...

// conditional return AFTER all hooks
const isAuthPage = ...
if (isAuthPage) return null
```

---

## FIX #03 — ApiResponse status vs success field mismatch
### lib/api/data/home.ts

BEFORE:
```ts
interface ApiResponse<T> {
  status: boolean  // INCONSISTENT with auth.ts
  data: T
}

// app/page.tsx — checks wrong field
const homeData = homeResponse.status ? homeResponse.data : null
```

AFTER:
```ts
// Unified across ALL API files
interface ApiResponse<T> {
  success: boolean
  data: T
}

// app/page.tsx — consistent
const homeData = homeResponse.success ? homeResponse.data : null
```

Also update: every file that imports ApiResponse from home.ts — search for `.status` on ApiResponse objects and change to `.success`.

---

## FIX #04 — JWT in URL query param
### app/student-dashboard/page.tsx · L25

BEFORE:
```ts
redirectUrl += `?auth_token=${auth_token}&email=${user.email}`
```

AFTER:
```ts
// Backend: issue a one-time nonce (30s TTL, single-use)
const { nonce } = await getLoginNonce(auth_token)
redirectUrl += `?nonce=${nonce}`
// Student portal: exchange nonce server-side for session
// Never pass long-lived JWTs in URLs
```

Backend implementation:
```php
// Laravel: generate nonce
$nonce = Str::random(64);
Cache::put("nonce:{$nonce}", $userId, 30); // 30 second TTL
return ['nonce' => $nonce];

// Redeem:
$userId = Cache::pull("nonce:{$nonce}"); // pull = get + delete (single use)
if (!$userId) abort(401);
```

---

## FIX #05 — dangerouslySetInnerHTML without DOMPurify
### CollegeDetailClient.tsx, CourseDetailClient.tsx, student-va/page.tsx, HeroSection.tsx, ApplicationSection.tsx

Install: `npm install dompurify @types/dompurify`

BEFORE (in each of the 7+ locations):
```tsx
<div dangerouslySetInnerHTML={{ __html: college.description }} />
```

AFTER:
```tsx
import DOMPurify from 'dompurify'

// Inside component (client-side only — DOMPurify needs window):
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(college.description, {
  ALLOWED_TAGS: ['p','br','strong','em','h2','h3','ul','ol','li','a','blockquote'],
  ALLOWED_ATTR: ['href','target','rel'],
  FORBID_TAGS: ['script','iframe','object'],
  FORBID_ATTR: ['onerror','onload','onclick'],
}) }} />
```

NOTE: JSON-LD script tags using `JSON.stringify(jsonLd)` do NOT need DOMPurify — JSON.stringify output cannot contain executable HTML. Only sanitize raw HTML strings from your CMS/database.

---

## FIX #06 — localStorage JSON.parse crash
### contexts/auth/AuthContext.tsx · L37

BEFORE:
```ts
const userData = localStorage.getItem('user')
if (token && userData) {
  setUser(JSON.parse(userData))  // throws if malformed
}
```

AFTER:
```ts
try {
  const userData = localStorage.getItem('user')
  if (token && userData) {
    setUser(JSON.parse(userData))
    setToken(token)
  }
} catch {
  // Malformed storage — clear and stay logged out
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
```

---

## FIX #07 — next/image wildcard remotePatterns
### next.config.mjs

BEFORE:
```js
remotePatterns: [
  { protocol: 'https', hostname: '**' },
  { protocol: 'http', hostname: '**' },
]
```

AFTER:
```js
remotePatterns: [
  { protocol: 'https', hostname: 'panel.gyansanchaar.com' },
  { protocol: 'https', hostname: 'cdn.gyansanchaar.com' },
  // Add only the real hostnames your CMS and media CDN use
]
```

---

## FIX #08 — Auth redirect commented out
### contexts/auth/AuthContext.tsx · L28–32

BEFORE:
```ts
// useEffect(() => {
//   if (!!user && (pathname === '/login'...)) {
//     router.replace('/')
//   }
// }, [!!user, pathname, router])
```

AFTER:
```ts
useEffect(() => {
  if (user && (pathname === '/login' || pathname === '/register')) {
    router.replace('/')
  }
}, [user, pathname, router])  // 'user' not '!!user' — avoids stale closure
```

---

## FIX #09 — console.log in production
### lib/api/data/auth.ts · L73, L75

BEFORE:
```ts
} catch (error) {
  console.log(error)                          // remove
  if (axios.isAxiosError(error)) {
    console.log(error.response.data)          // remove
    throw error.response.data
  }
}
```

AFTER:
```ts
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    throw error.response.data as ApiErrorResponse
  }
  throw error
}
```

---

## FIX #10 — swcMinify deprecated
### next.config.mjs · L13

BEFORE:
```js
experimental: {
  optimizeCss: true,
  swcMinify: true,  // deprecated since Next 13
}
```

AFTER:
```js
experimental: {
  optimizeCss: true,
  // swcMinify removed — it's the default and this flag is ignored
}
```

---

## FIX #11 — compress: false
### next.config.mjs · L3

BEFORE:
```js
const nextConfig = {
  compress: false,
```

AFTER:
```js
const nextConfig = {
  // compress removed — Next.js default is true
  // Only set compress:false if you are 100% certain your
  // CDN/proxy (Cloudflare/nginx) handles gzip or brotli
```

Since you're using Cloudflare (proxied), Cloudflare handles compression.
`compress: false` is actually correct here — but add the comment so no one removes Cloudflare thinking this is safe.

---

## FIX #12 — Google Places Details missing .ok check
### app/api/google-places/textsearch/route.ts · L47–50

BEFORE:
```ts
const detailsRes = await fetch(detailsUrl)
const detailsData = await detailsRes.json()  // no .ok check
```

AFTER:
```ts
const detailsRes = await fetch(detailsUrl)
if (!detailsRes.ok) {
  return NextResponse.json(
    { error: 'Places Details API error' },
    { status: detailsRes.status }
  )
}
const detailsData = await detailsRes.json()
```

---

## Priority order

1. **Deploy block**: Fix #01 + #02 + #03 now. Do not deploy without these.
2. **Before public launch**: Fix #04 + #05 + #06. Security vulnerabilities.
3. **Sprint backlog**: #07 + #08. Configuration + UX.
4. **Next cleanup**: #09 + #10 + #11 + #12.
