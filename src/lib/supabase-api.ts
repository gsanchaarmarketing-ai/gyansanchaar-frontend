/**
 * GyanSanchaar — Supabase public data API
 * All public catalogue queries. Used by server components for SSR.
 * Uses LEFT JOINs (no !inner) — safe with RLS on joined tables.
 */

import { createClient } from '@supabase/supabase-js'

function getSb() {
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
  const sb = getSb()

  // Simple select — no nested joins that could fail with RLS
  let q = sb
    .from('colleges')
    .select('id,name,slug,type,city,nirf_rank,naac_grade,ugc_verified,logo_path,is_featured,placement_data,state_id,states(name,slug)', { count: 'exact' })
    .eq('is_active', true)
    .is('deleted_at', null)

  if (params.featured) q = q.eq('is_featured', true)
  if (params.state_id) q = q.eq('state_id', params.state_id)
  if (params.type)     q = q.eq('type', params.type)
  if (params.q)        q = q.ilike('name', `%${params.q}%`)
  if (params.stream_id) {
    const { data: ids } = await sb.from('college_stream').select('college_id').eq('stream_id', params.stream_id)
    if (ids?.length) q = q.in('id', ids.map((r: any) => r.college_id))
    else return { data: [], count: 0 }
  }

  q = q.order('is_featured', { ascending: false })
       .order('nirf_rank',   { ascending: true,  nullsFirst: false })
       .order('name')

  if (params.limit)  q = q.limit(params.limit)
  if (params.offset) q = q.range(params.offset, params.offset + (params.limit ?? 20) - 1)

  const { data, count, error } = await q
  if (error) { console.error('getColleges:', error.message); return { data: [], count: 0 } }

  // Attach streams separately to avoid RLS join issues
  const colleges = data ?? []
  if (colleges.length) {
    const ids = colleges.map((c: any) => c.id)
    const { data: cs } = await sb
      .from('college_stream')
      .select('college_id,streams(name)')
      .in('college_id', ids)

    const streamMap: Record<number, string[]> = {}
    for (const r of cs ?? []) {
      if (!streamMap[r.college_id]) streamMap[r.college_id] = []
      if ((r.streams as any)?.name) streamMap[r.college_id].push((r.streams as any).name)
    }
    colleges.forEach((c: any) => { c.streams = (streamMap[c.id] ?? []).map((n: string) => ({ name: n })) })
  }

  return { data: colleges, count: count ?? 0 }
}

export async function getCollegeBySlug(slug: string): Promise<any | null> {
  const sb = getSb()

  const { data: college, error } = await sb
    .from('colleges')
    .select('*,states(name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  if (error || !college) return null

  // Streams
  const { data: cs } = await sb.from('college_stream').select('streams(id,name)').eq('college_id', college.id)
  college.streams = (cs ?? []).map((r: any) => r.streams).filter(Boolean)

  // Courses with pivot
  const { data: cc } = await sb
    .from('college_course')
    .select('fee,seats,branches,admission_process,is_active,courses(id,name,slug,level,duration_months,default_fee,fee_min,fee_max,description,overview_image,streams(name))')
    .eq('college_id', college.id)
    .eq('is_active', true)

  college.courses = (cc ?? [])
    .filter((r: any) => r.courses)
    .map((r: any) => ({
      ...r.courses,
      stream: r.courses.streams ?? null,
      pivot: { fee: r.fee, seats: r.seats, branches: r.branches, admission_process: r.admission_process },
    }))

  return college
}

// ── COURSES ───────────────────────────────────────────────────────────────

export async function getCourses(params: {
  level?: string
  stream_id?: number
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  const sb = getSb()
  let q = sb
    .from('courses')
    .select('id,name,slug,level,duration_months,default_fee,fee_min,fee_max,description,overview_image,streams(id,name)', { count: 'exact' })
    .eq('is_active', true)

  if (params.level)     q = q.eq('level', params.level)
  if (params.stream_id) q = q.eq('stream_id', params.stream_id)
  if (params.q)         q = q.ilike('name', `%${params.q}%`)

  q = q.order('name')
  if (params.limit)  q = q.limit(params.limit)
  if (params.offset) q = q.range(params.offset, params.offset + (params.limit ?? 20) - 1)

  const { data, count, error } = await q
  if (error) { console.error('getCourses:', error.message); return { data: [], count: 0 } }
  return { data: data ?? [], count: count ?? 0 }
}

export async function getCourseBySlug(slug: string): Promise<any | null> {
  const sb = getSb()
  const { data: course, error } = await sb
    .from('courses')
    .select('*,streams(id,name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !course) return null

  const { data: cc } = await sb
    .from('college_course')
    .select('fee,seats,branches,admission_process,colleges(id,name,slug,city,logo_path,ugc_verified,states(name))')
    .eq('course_id', course.id)
    .eq('is_active', true)

  course.stream = course.streams ?? null
  course.colleges = (cc ?? []).map((r: any) => ({
    ...r.colleges,
    state: r.colleges?.states ?? null,
    pivot: { fee: r.fee, seats: r.seats, branches: r.branches, admission_process: r.admission_process },
  }))

  return course
}

// ── ARTICLES ──────────────────────────────────────────────────────────────

export async function getArticles(params: {
  category?: string
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  const sb = getSb()
  let q = sb
    .from('articles')
    .select('id,title,slug,category,excerpt,featured_image,published_at,views,reading_time', { count: 'exact' })
    .eq('status', 'published')
    .is('deleted_at', null)

  if (params.category) q = q.eq('category', params.category)
  if (params.q)        q = q.ilike('title', `%${params.q}%`)

  q = q.order('published_at', { ascending: false })
  if (params.limit)  q = q.limit(params.limit)
  if (params.offset) q = q.range(params.offset, params.offset + (params.limit ?? 20) - 1)

  const { data, count, error } = await q
  if (error) { console.error('getArticles:', error.message); return { data: [], count: 0 } }
  return { data: data ?? [], count: count ?? 0 }
}

export async function getArticleBySlug(slug: string): Promise<any | null> {
  const sb = getSb()
  const { data, error } = await sb
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()

  if (error || !data) return null
  // Async view increment — fire and forget
  sb.from('articles').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id).then(() => {})
  return data
}

// ── EXAMS ─────────────────────────────────────────────────────────────────

export async function getExams(params: { level?: string; limit?: number } = {}): Promise<any[]> {
  const sb = getSb()
  let q = sb
    .from('exams')
    .select('*')
    .eq('is_active', true)
    .order('exam_date', { ascending: true, nullsFirst: false })

  if (params.level) q = q.eq('level', params.level)
  if (params.limit) q = q.limit(params.limit)

  const { data, error } = await q
  if (error) { console.error('getExams:', error.message); return [] }

  // Attach streams separately
  const exams = data ?? []
  if (exams.length) {
    const { data: es } = await sb
      .from('exam_stream')
      .select('exam_id,streams(name)')
      .in('exam_id', exams.map((e: any) => e.id))

    const map: Record<number, string[]> = {}
    for (const r of es ?? []) {
      if (!map[r.exam_id]) map[r.exam_id] = []
      if ((r.streams as any)?.name) map[r.exam_id].push((r.streams as any).name)
    }
    exams.forEach((e: any) => { e.streams = (map[e.id] ?? []).map((n: string) => ({ name: n })) })
  }

  return exams
}

export async function getExamBySlug(slug: string): Promise<any | null> {
  const sb = getSb()
  const { data, error } = await sb.from('exams').select('*').eq('slug', slug).eq('is_active', true).single()
  if (error || !data) return null

  const { data: es } = await sb.from('exam_stream').select('streams(id,name)').eq('exam_id', data.id)
  data.streams = (es ?? []).map((r: any) => r.streams).filter(Boolean)
  return data
}

// ── STATES / STREAMS ──────────────────────────────────────────────────────

export async function getStates(): Promise<any[]> {
  const sb = getSb()
  const { data, error } = await sb.from('states').select('id,name,slug,region').eq('is_active', true).order('name')
  if (error) { console.error('getStates:', error.message); return [] }
  return data ?? []
}

export async function getStreams(): Promise<any[]> {
  const sb = getSb()
  const { data, error } = await sb.from('streams').select('id,name,short,slug').eq('is_active', true).order('sort_order')
  if (error) { console.error('getStreams:', error.message); return [] }
  return data ?? []
}

// ── MEDIA / TEAM ──────────────────────────────────────────────────────────

export async function getMediaLogos(): Promise<any[]> {
  const sb = getSb()
  const { data } = await sb.from('media_logos').select('id,name,logo_url,website_url').eq('is_active', true).order('sort_order')
  return data ?? []
}

export async function getTeam(): Promise<any[]> {
  const sb = getSb()
  const { data } = await sb.from('team_members').select('*').eq('is_active', true).order('sort_order')
  return data ?? []
}

// ── SEARCH ────────────────────────────────────────────────────────────────

export async function search(query: string): Promise<{ colleges: any[]; courses: any[]; articles: any[] }> {
  if (!query || query.length < 2) return { colleges: [], courses: [], articles: [] }
  const sb = getSb()

  const [collegesRes, coursesRes, articlesRes] = await Promise.all([
    sb.from('colleges').select('id,name,slug,city,states(name),logo_path').eq('is_active', true).is('deleted_at', null).ilike('name', `%${query}%`).limit(5),
    sb.from('courses').select('id,name,slug,level,streams(name)').eq('is_active', true).ilike('name', `%${query}%`).limit(5),
    sb.from('articles').select('id,title,slug,category,excerpt').eq('status', 'published').is('deleted_at', null).ilike('title', `%${query}%`).limit(5),
  ])

  return {
    colleges: collegesRes.data ?? [],
    courses:  coursesRes.data  ?? [],
    articles: articlesRes.data ?? [],
  }
}
