import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json({
    commit: '54bb6df',
    header_is_server: 'yes',
    wizard_has_levels: 'yes',
    built_at: new Date().toISOString(),
  })
}
