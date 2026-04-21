# GyanSanchaar — Frontend

Next.js 14 App Router frontend for GyanSanchaar education discovery platform.

- **Framework:** Next.js 14.2 (App Router, TypeScript strict)
- **Styling:** Tailwind CSS + Radix UI + shadcn/ui components
- **State:** TanStack Query v5
- **Forms:** react-hook-form + zod
- **i18n:** next-intl (English + Hindi)
- **Auth:** httpOnly cookie (token set via Next.js route handler after Sanctum bearer auth)
- **Deploy:** Vercel, region bom1 (Mumbai)

## API

All data from `GyanSanchaar-adminBackend` Laravel API.
Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend URL.

## Push to GitHub

```bash
cd ~/Downloads
unzip gyansanchaar-frontend.zip
cd GyanSanchaar

# If the repo already has content (clone first):
git clone https://github.com/amitabh-pixel/GyanSanchaar.git temp-clone
cp -r temp-clone/.git .git
rm -rf temp-clone

git add .
git commit -m "feat: Next.js 14 frontend — App Router, SSR, i18n en+hi, DPDP compliant"
git push origin main
```

Or if starting fresh:
```bash
git init
git branch -M main
git remote add origin https://github.com/amitabh-pixel/GyanSanchaar.git
git add .
git commit -m "feat: Next.js 14 frontend"
git push -u origin main
```

## Local dev

```bash
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

## Deploy to Vercel

1. Import `GyanSanchaar` repo on https://vercel.com/new
2. Framework: Next.js (auto-detected)
3. Set env vars:
   - `NEXT_PUBLIC_API_URL` = `https://api.gyansanchaar.cloud/api/v1`
   - `NEXT_PUBLIC_APP_URL` = `https://gyansanchaar.cloud`
4. Deploy. Vercel auto-sets region bom1 (Mumbai) from `vercel.json`.
5. Add custom domain `gyansanchaar.cloud` in Vercel dashboard.
6. Cloudflare: CNAME `gyansanchaar.cloud` → Vercel CNAME target.

## Pages

| Route | Type | Auth |
|---|---|---|
| `/` | SSR + ISR 5min | Public |
| `/colleges` | SSR + ISR | Public |
| `/colleges/[slug]` | SSR + ISR | Public |
| `/courses`, `/courses/[slug]` | SSR | Public |
| `/articles`, `/articles/[slug]` | SSR | Public |
| `/exams` | SSR | Public |
| `/grievance` | Client | Public |
| `/login`, `/register`, `/verify-otp` | Client | Guest only |
| `/dashboard/*` | SSR | Auth (redirects to /login) |
| `/parent-consent/[token]` | SSR | Public |

## DPDP compliance notes

- Registration captures explicit, unbundled consents — two required (application + communication), two optional (marketing + analytics)
- Parental consent: minor accounts get a non-blocking dashboard banner; applications gate at `MinorConsentRequired`
- `/dashboard/privacy` — right to access summary, consent management, erasure request
- Grievance form available without login; IT Rules 2021 officer details shown
- Anti-ragging notice on every college detail page (UGC mandate)
