/**
 * GyanSanchaar — Supabase public data API
 * All queries use simple joins (no !inner) for reliability across RLS states.
 */

import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── COLLEGES ──────────────────────────────────────────────────────────────

export async function getColleges(params: {
  featured?: boolean
  state_id?: number
  type?: string
  stream_id?: number
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  try {
    let q = sb()
      .from('colleges')
      .select('id,name,slug,type,city,nirf_rank,naac_grade,ugc_verified,logo_path,is_featured,placement_data,state_id', { count: 'exact' })
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('nirf_rank',   { ascending: true,  nullsFirst: false })
      .order('name')

    if (params.featured)  q = q.eq('is_featured', true)
    if (params.state_id)  q = q.eq('state_id', params.state_id)
    if (params.type)      q = q.eq('type', params.type)
    if (params.q)         q = q.ilike('name', `%${params.q}%`)
    if (params.limit)     q = q.limit(params.limit)
    if (params.offset)    q = q.range(params.offset, params.offset + (params.limit ?? 20) - 1)

    const { data: colleges, count, error } = await q
    if (error) { console.error('getColleges:', error.message); return { data: [], count: 0 } }

    // Enrich with state names separately to avoid join complexity
    const stateIds = [...new Set((colleges ?? []).map((c: any) => c.state_id).filter(Boolean))]
    let stateMap: Record<number, string> = {}
    if (stateIds.length) {
      const { data: states } = await sb().from('states').select('id,name,slug').in('id', stateIds)
      stateMap = Object.fromEntries((states ?? []).map((s: any) => [s.id, s]))
    }

    // Enrich with streams separately
    const collegeIds = (colleges ?? []).map((c: any) => c.id)
    let streamMap: Record<number, string[]> = {}
    if (collegeIds.length) {
      const { data: cs } = await sb()
        .from('college_stream')
        .select('college_id,stream_id,streams(name)')
        .in('college_id', collegeIds)
      ;(cs ?? []).forEach((row: any) => {
        if (!streamMap[row.college_id]) streamMap[row.college_id] = []
        if (row.streams?.name) streamMap[row.college_id].push(row.streams.name)
      })
    }

    const enriched = (colleges ?? []).map((c: any) => ({
      ...c,
      state: stateMap[c.state_id] ?? null,
      streams: (streamMap[c.id] ?? []).map((name: string) => ({ name })),
    }))

    return { data: enriched, count: count ?? 0 }
  } catch (e: any) {
    console.error('getColleges exception:', e.message)
    return { data: [], count: 0 }
  }
}

export async function getCollegeBySlug(slug: string): Promise<any | null> {
  try {
    const { data: college, error } = await sb()
      .from('colleges')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    if (error || !college) return null

    const [stateRes, streamsRes, coursesRes] = await Promise.all([
      college.state_id
        ? sb().from('states').select('id,name,slug').eq('id', college.state_id).single()
        : Promise.resolve({ data: null }),
      sb().from('college_stream').select('stream_id,streams(id,name)').eq('college_id', college.id),
      sb().from('college_course').select(`
        fee, seats, branches, admission_process, is_active,
        courses(id,name,slug,level,duration_months,default_fee,description,streams(name))
      `).eq('college_id', college.id).eq('is_active', true),
    ])

    const courses = (coursesRes.data ?? [])
      .filter((cc: any) => cc.courses)
      .map((cc: any) => ({
        ...cc.courses,
        stream: cc.courses.streams ?? null,
        pivot: { fee: cc.fee, seats: cc.seats, branches: cc.branches, admission_process: cc.admission_process },
      }))

    return {
      ...college,
      state: stateRes.data ?? null,
      streams: (streamsRes.data ?? []).map((cs: any) => cs.streams).filter(Boolean),
      courses,
    }
  } catch (e: any) {
    console.error('getCollegeBySlug:', e.message)
    return null
  }
}

// ── COURSES ───────────────────────────────────────────────────────────────

export async function getCourses(params: {
  level?: string; stream_id?: number; q?: string; limit?: number
} = {}): Promise<{ data: any[]; count: number }> {
  try {
    let q = sb()
      .from('courses')
      .select('id,name,slug,level,duration_months,default_fee,fee_min,fee_max,description,overview_image,stream_id', { count: 'exact' })
      .eq('is_active', true)
      .order('name')

    if (params.level)     q = q.eq('level', params.level)
    if (params.stream_id) q = q.eq('stream_id', params.stream_id)
    if (params.q)         q = q.ilike('name', `%${params.q}%`)
    if (params.limit)     q = q.limit(params.limit)

    const { data, count, error } = await q
    if (error) { console.error('getCourses:', error.message); return { data: [], count: 0 } }

    // Enrich with stream names
    const streamIds = [...new Set((data ?? []).map((c: any) => c.stream_id).filter(Boolean))]
    let streamMap: Record<number, any> = {}
    if (streamIds.length) {
      const { data: streams } = await sb().from('streams').select('id,name,slug').in('id', streamIds)
      streamMap = Object.fromEntries((streams ?? []).map((s: any) => [s.id, s]))
    }
    const enriched = (data ?? []).map((c: any) => ({ ...c, streams: streamMap[c.stream_id] ?? null }))
    return { data: enriched, count: count ?? 0 }
  } catch (e: any) {
    console.error('getCourses exception:', e.message)
    return { data: [], count: 0 }
  }
}

export async function getCourseBySlug(slug: string): Promise<any | null> {
  try {
    const { data: course } = await sb()
      .from('courses')
      .select('*,streams(id,name,slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!course) return null

    const { data: cc } = await sb()
      .from('college_course')
      .select('fee,seats,branches,admission_process,colleges(id,name,slug,city,logo_path,ugc_verified,state_id)')
      .eq('course_id', course.id)
      .eq('is_active', true)

    return {
      ...course,
      stream: course.streams ?? null,
      colleges: (cc ?? []).map((c: any) => ({ ...c.colleges, pivot: { fee: c.fee, seats: c.seats, branches: c.branches, admission_process: c.admission_process } })),
    }
  } catch (e: any) {
    console.error('getCourseBySlug:', e.message)
    return null
  }
}

// ── ARTICLES ──────────────────────────────────────────────────────────────

export async function getArticles(params: {
  category?: string; q?: string; limit?: number; offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  try {
    let q = sb()
      .from('articles')
      .select('id,title,slug,category,excerpt,featured_image,published_at,views,reading_time', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })

    if (params.category) q = q.eq('category', params.category)
    if (params.q)        q = q.ilike('title', `%${params.q}%`)
    if (params.limit)    q = q.limit(params.limit)

    const { data, count, error } = await q
    if (error) { console.error('getArticles:', error.message); return { data: [], count: 0 } }
    return { data: data ?? [], count: count ?? 0 }
  } catch (e: any) {
    console.error('getArticles exception:', e.message)
    return { data: [], count: 0 }
  }
}

export async function getArticleBySlug(slug: string): Promise<any | null> {
  try {
    const { data } = await sb()
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single()

    if (data) {
      sb().from('articles').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id).then(() => {})
    }
    return data ?? null
  } catch { return null }
}

// ── EXAMS ─────────────────────────────────────────────────────────────────

export async function getExams(params: { level?: string; limit?: number } = {}): Promise<any[]> {
  try {
    let q = sb()
      .from('exams')
      .select('*')
      .eq('is_active', true)
      .order('exam_date', { ascending: true, nullsFirst: false })

    if (params.level) q = q.eq('level', params.level)
    if (params.limit) q = q.limit(params.limit)

    const { data, error } = await q
    if (error) { console.error('getExams:', error.message); return [] }

    // Enrich with streams
    const examIds = (data ?? []).map((e: any) => e.id)
    let streamsMap: Record<number, string[]> = {}
    if (examIds.length) {
      const { data: es } = await sb()
        .from('exam_stream')
        .select('exam_id,streams(name)')
        .in('exam_id', examIds)
      ;(es ?? []).forEach((row: any) => {
        if (!streamsMap[row.exam_id]) streamsMap[row.exam_id] = []
        if (row.streams?.name) streamsMap[row.exam_id].push(row.streams.name)
      })
    }

    return (data ?? []).map((e: any) => ({
      ...e,
      streams: (streamsMap[e.id] ?? []).map((name: string) => ({ name })),
    }))
  } catch (e: any) {
    console.error('getExams exception:', e.message)
    return []
  }
}

export async function getExamBySlug(slug: string): Promise<any | null> {
  try {
    const { data } = await sb().from('exams').select('*').eq('slug', slug).eq('is_active', true).single()
    if (!data) return null
    const { data: es } = await sb().from('exam_stream').select('streams(name)').eq('exam_id', data.id)
    return { ...data, streams: (es ?? []).map((r: any) => r.streams).filter(Boolean) }
  } catch { return null }
}

// ── LOOKUP TABLES ─────────────────────────────────────────────────────────

export async function getStates(): Promise<any[]> {
  try {
    const { data } = await sb().from('states').select('id,name,slug,region').eq('is_active', true).order('name')
    return data ?? []
  } catch { return [] }
}

export async function getStreams(): Promise<any[]> {
  try {
    const { data } = await sb().from('streams').select('id,name,short,slug').eq('is_active', true).order('sort_order')
    return data ?? []
  } catch { return [] }
}

export async function getMediaLogos(): Promise<any[]> {
  try {
    const { data } = await sb().from('media_logos').select('id,name,logo_url,website_url').eq('is_active', true).order('sort_order')
    return data ?? []
  } catch { return [] }
}

export async function getTeam(): Promise<any[]> {
  try {
    const { data } = await sb().from('team_members').select('*').eq('is_active', true).order('sort_order')
    return data ?? []
  } catch { return [] }
}

// ── SEARCH ────────────────────────────────────────────────────────────────

export async function search(query: string): Promise<{ colleges: any[]; courses: any[]; articles: any[] }> {
  if (!query || query.length < 2) return { colleges: [], courses: [], articles: [] }
  try {
    const [collegesRes, coursesRes, articlesRes] = await Promise.all([
      sb().from('colleges').select('id,name,slug,city,state_id').eq('is_active', true).is('deleted_at', null).ilike('name', `%${query}%`).limit(5),
      sb().from('courses').select('id,name,slug,level').eq('is_active', true).ilike('name', `%${query}%`).limit(5),
      sb().from('articles').select('id,title,slug,category,excerpt').eq('status', 'published').is('deleted_at', null).ilike('title', `%${query}%`).limit(5),
    ])
    return {
      colleges: collegesRes.data ?? [],
      courses:  coursesRes.data  ?? [],
      articles: articlesRes.data ?? [],
    }
  } catch { return { colleges: [], courses: [], articles: [] } }
}
