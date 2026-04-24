import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const BACKEND = 'https://gyansanchaar-backend-main-q8sodv.free.laravel.cloud/api/v1'
  const apiUrl = process.env.API_INTERNAL_URL
    ?? process.env.NEXT_PUBLIC_API_URL
    ?? BACKEND

  let backendStatus = 'unknown'
  let backendData: any = null

  try {
    const res = await fetch(`${apiUrl}/public/colleges?per_page=3`, {
      signal: AbortSignal.timeout(8000),
    })
    backendStatus = `HTTP ${res.status}`
    backendData = await res.json()
  } catch (err: any) {
    backendStatus = `ERROR: ${err.message}`
  }

  return NextResponse.json({
    env: {
      API_INTERNAL_URL: process.env.API_INTERNAL_URL ?? 'NOT SET',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'NOT SET',
      resolved: apiUrl,
    },
    backend: {
      status: backendStatus,
      collegeCount: backendData?.meta?.total ?? backendData?.data?.length ?? null,
    },
  })
}
