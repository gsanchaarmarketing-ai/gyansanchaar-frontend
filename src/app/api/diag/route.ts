import { NextResponse } from 'next/server'
import { publicApi } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: any = { steps: [] }

  // Step 1: Use the actual publicApi.colleges() function as the page does
  try {
    const colleges = await publicApi.colleges({ per_page: '12' })
    result.steps.push({
      step: 1,
      ok: true,
      shape: {
        hasData: 'data' in colleges,
        hasMeta: 'meta' in colleges,
        dataKeys: colleges.data?.[0] ? Object.keys(colleges.data[0]) : [],
        firstCollege: colleges.data?.[0] ?? null,
      }
    })
  } catch (e: any) {
    result.steps.push({ step: 1, error: e.message, stack: e.stack?.split('\n').slice(0, 5) })
    return NextResponse.json(result)
  }

  // Step 2: states
  try {
    const r = await publicApi.states()
    result.steps.push({ step: 2, ok: true, count: r.data?.length })
  } catch (e: any) {
    result.steps.push({ step: 2, error: e.message })
  }

  // Step 3: streams
  try {
    const r = await publicApi.streams()
    result.steps.push({ step: 3, ok: true, count: r.data?.length })
  } catch (e: any) {
    result.steps.push({ step: 3, error: e.message })
  }

  return NextResponse.json(result)
}
