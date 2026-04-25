import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const BACKEND = 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'
  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? BACKEND

  const result: any = { apiUrl, tests: {} }

  for (const [name, path] of [
    ['colleges', '/public/colleges?per_page=2'],
    ['courses',  '/public/courses?per_page=2'],
    ['exams',    '/public/exams'],
  ]) {
    try {
      const r = await fetch(`${apiUrl}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
      const data = await r.json()
      result.tests[name] = {
        httpStatus: r.status,
        topLevelKeys: Object.keys(data),
        hasMeta: 'meta' in data,
        dataIsArray: Array.isArray(data.data),
        dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
        firstItem: Array.isArray(data.data) && data.data[0]
          ? Object.fromEntries(Object.entries(data.data[0]).slice(0, 8))
          : null,
      }
    } catch (e: any) {
      result.tests[name] = { error: e.message }
    }
  }

  return NextResponse.json(result, { status: 200 })
}
