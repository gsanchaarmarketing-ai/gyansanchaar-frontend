import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
// Cache for 6 hours — reviews don't change that often
export const revalidate = 21600

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * GET /api/reviews/[placeId]
 * Fetches up to 5 Google Places reviews + rating data.
 * Server-side only — API key never exposed to browser.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { placeId: string } }
) {
  if (!GOOGLE_KEY) {
    return NextResponse.json({ error: 'Google Places API not configured' }, { status: 503 })
  }

  const { placeId } = params
  if (!placeId || !placeId.startsWith('ChIJ')) {
    return NextResponse.json({ error: 'Invalid Place ID' }, { status: 400 })
  }

  try {
    // Google Places Details API (legacy — widely supported, returns up to 5 reviews)
    const url = `https://maps.googleapis.com/maps/api/place/details/json`
      + `?place_id=${placeId}`
      + `&fields=name,rating,user_ratings_total,reviews,url`
      + `&reviews_sort=most_relevant`
      + `&language=en`
      + `&key=${GOOGLE_KEY}`

    const res = await fetch(url, { next: { revalidate: 21600 } })
    if (!res.ok) throw new Error(`Google API error: ${res.status}`)

    const data = await res.json()

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message ?? data.status }, { status: 400 })
    }

    const place = data.result
    const reviews = (place.reviews ?? []).map((r: any) => ({
      author:     r.author_name,
      avatar:     r.profile_photo_url ?? null,
      rating:     r.rating,
      text:       r.text,
      time:       r.relative_time_description,
      timestamp:  r.time,
    }))

    // Optionally update the DB cache
    if (place.rating) {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await sb.from('colleges')
        .update({
          google_rating:       place.rating,
          google_rating_count: place.user_ratings_total,
          google_maps_url:     place.url ?? null,
        })
        .eq('google_place_id', placeId)
    }

    return NextResponse.json({
      name:         place.name,
      rating:       place.rating,
      total_ratings:place.user_ratings_total,
      maps_url:     place.url,
      reviews,      // up to 5 — Google's hard limit
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' }
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
