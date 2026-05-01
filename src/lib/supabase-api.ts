/**
 * GyanSanchaar — Supabase public data API
 * Replaces all Laravel /api/v1/public/* calls.
 * Used by server components for SSR data fetching.
 */

import { createClient } from '@supabase/supabase-js'

function sb() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!url || !anon) throw new Error('Supabase env vars not set')
  return createClient(url, anon)
}

// ── COLLEGES ──────────────────────────────────────────────────────────────

export interface CollegeListItem {
  id: number
  name: string
  slug: string
  type: string
  city: string
  state: { name: string; slug: string } | null
  nirf_rank: number | null
  naac_grade: string | null
  ugc_verified: boolean
  logo_path: string | null
  is_featured: boolean
  placement_data: any
  streams: { name: string }[]
}

export interface CollegeDetail extends CollegeListItem {
  address: string | null
  about: string | null
  website: string | null
  contact_email: string | null
  campus_video_url: string | null
  gallery: string[] | null
  hostel_info: any
  fee_notes: string | null
  established_year: number | null
  approvals: string | null
  courses: CourseWithPivot[]
}

export interface CourseWithPivot {
  id: number
  name: string
  slug: string
  level: string
  duration_months: number
  default_fee: number | null
  fee_min: number | null
  fee_max: number | null
  description: string | null
  overview_image: string | null
  stream: { name: string } | null
  pivot: { fee: number | null; seats: number | null; branches: string | null; admission_process: string | null }
}

export async function getColleges(params: {
  featured?: boolean
  state_id?: number
  type?: string
  stream_id?: number
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: CollegeListItem[]; count: number }> {
  let q = sb()
    .from('colleges')
    .select(`
      id, name, slug, type, city, nirf_rank, naac_grade,
      ugc_verified, logo_path, is_featured, placement_data,
      states!inner(name, slug),
      college_stream!inner(stream_id, streams!inner(name))
    `, { count: 'exact' })
    .eq('is_active', true)
    .is('deleted_at', null)

  if (params.featured) q = q.eq('is_featured', true)
  if (params.state_id) q = q.eq('state_id', params.state_id)
  if (params.type)     q = q.eq('type', params.type)
  if (params.q)        q = q.ilike('name', `%${params.q}%`)

  q = q.order('is_featured', { ascending: false })
       .order('nirf_rank', { ascending: true, nullsFirst: false })
       .order('name')

  if (params.limit)  q = q.limit(params.limit)
  if (params.offset) q = q.range(params.offset, params.offset + (params.limit ?? 20) - 1)

  const { data, count, error } = await q
  if (error) { console.error('getColleges error:', error.message); return { data: [], count: 0 } }

  const colleges = (data ?? []).map((c: any) => ({
    ...c,
    state: c.states ?? null,
    streams: (c.college_stream ?? []).map((cs: any) => cs.streams),
  }))

  return { data: colleges, count: count ?? 0 }
}

export async function getCollegeBySlug(slug: string): Promise<CollegeDetail | null> {
  const { data, error } = await sb()
    .from('colleges')
    .select(`
      *, states(name, slug),
      college_stream(streams(id, name)),
      college_course(
        fee, seats, branches, admission_process, is_active,
        courses(id, name, slug, level, duration_months, default_fee, fee_min, fee_max,
                description, overview_image, streams(name))
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null

  const courses: CourseWithPivot[] = (data.college_course ?? [])
    .filter((cc: any) => cc.is_active && cc.courses)
    .map((cc: any) => ({
      ...cc.courses,
      stream: cc.courses.streams ?? null,
      pivot: { fee: cc.fee, seats: cc.seats, branches: cc.branches, admission_process: cc.admission_process },
    }))

  return {
    ...data,
    state: data.states ?? null,
    streams: (data.college_stream ?? []).map((cs: any) => cs.streams),
    courses,
  }
}

// ── COURSES ───────────────────────────────────────────────────────────────

export async function getCourses(params: {
  level?: string
  stream_id?: number
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  let q = sb()
    .from('courses')
    .select('id, name, slug, level, duration_months, default_fee, fee_min, fee_max, description, overview_image, streams(id, name)', { count: 'exact' })
    .eq('is_active', true)

  if (params.level)     q = q.eq('level', params.level)
  if (params.stream_id) q = q.eq('stream_id', params.stream_id)
  if (params.q)         q = q.ilike('name', `%${params.q}%`)

  q = q.order('name')
  if (params.limit) q = q.limit(params.limit)

  const { data, count, error } = await q
  if (error) { console.error('getCourses error:', error.message); return { data: [], count: 0 } }
  return { data: data ?? [], count: count ?? 0 }
}

export async function getCourseBySlug(slug: string): Promise<any | null> {
  const { data: course } = await sb()
    .from('courses')
    .select('*, streams(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!course) return null

  // Get colleges offering this course
  const { data: cc } = await sb()
    .from('college_course')
    .select('fee, seats, branches, admission_process, colleges(id, name, slug, city, logo_path, ugc_verified, states(name))')
    .eq('course_id', course.id)
    .eq('is_active', true)

  return {
    ...course,
    stream: course.streams ?? null,
    colleges: (cc ?? []).map((c: any) => ({
      ...c.colleges,
      state: c.colleges?.states ?? null,
      pivot: { fee: c.fee, seats: c.seats, branches: c.branches, admission_process: c.admission_process },
    })),
  }
}

// ── ARTICLES ──────────────────────────────────────────────────────────────

export async function getArticles(params: {
  category?: string
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<{ data: any[]; count: number }> {
  let q = sb()
    .from('articles')
    .select('id, title, slug, category, excerpt, featured_image, published_at, views, reading_time', { count: 'exact' })
    .eq('status', 'published')
    .is('deleted_at', null)

  if (params.category) q = q.eq('category', params.category)
  if (params.q)        q = q.ilike('title', `%${params.q}%`)

  q = q.order('published_at', { ascending: false })
  if (params.limit) q = q.limit(params.limit)

  const { data, count, error } = await q
  if (error) return { data: [], count: 0 }
  return { data: data ?? [], count: count ?? 0 }
}

export async function getArticleBySlug(slug: string): Promise<any | null> {
  const { data } = await sb()
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()

  if (data) {
    // Increment views asynchronously — don't block render
    sb().from('articles').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id).then(() => {})
  }
  return data ?? null
}

// ── EXAMS ─────────────────────────────────────────────────────────────────

export async function getExams(params: {
  level?: string
  limit?: number
} = {}): Promise<any[]> {
  let q = sb()
    .from('exams')
    .select('*, exam_stream(streams(name))')
    .eq('is_active', true)
    .order('exam_date', { ascending: true, nullsFirst: false })

  if (params.level) q = q.eq('level', params.level)
  if (params.limit) q = q.limit(params.limit)

  const { data } = await q
  return (data ?? []).map((e: any) => ({
    ...e,
    streams: (e.exam_stream ?? []).map((es: any) => es.streams),
  }))
}

export async function getExamBySlug(slug: string): Promise<any | null> {
  const { data } = await sb()
    .from('exams')
    .select('*, exam_stream(streams(name))')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data ?? null
}

// ── STATES / STREAMS ───────────────────────────────────────────────────────

export async function getStates(): Promise<any[]> {
  const { data } = await sb().from('states').select('id, name, slug, region').eq('is_active', true).order('name')
  return data ?? []
}

export async function getStreams(): Promise<any[]> {
  const { data } = await sb().from('streams').select('id, name, short, slug').eq('is_active', true).order('sort_order')
  return data ?? []
}

// ── MEDIA LOGOS ───────────────────────────────────────────────────────────

export async function getMediaLogos(): Promise<any[]> {
  const { data } = await sb().from('media_logos').select('id, name, logo_url, website_url').eq('is_active', true).order('sort_order')
  return data ?? []
}

// ── TEAM MEMBERS ──────────────────────────────────────────────────────────

export async function getTeam(): Promise<any[]> {
  const { data } = await sb().from('team_members').select('*').eq('is_active', true).order('sort_order')
  return data ?? []
}

// ── SEARCH ────────────────────────────────────────────────────────────────

export async function search(query: string): Promise<{ colleges: any[]; courses: any[]; articles: any[] }> {
  if (!query || query.length < 2) return { colleges: [], courses: [], articles: [] }

  const [collegesRes, coursesRes, articlesRes] = await Promise.all([
    sb().from('colleges').select('id, name, slug, city, states(name), logo_path').eq('is_active', true).is('deleted_at', null).ilike('name', `%${query}%`).limit(5),
    sb().from('courses').select('id, name, slug, level, streams(name)').eq('is_active', true).ilike('name', `%${query}%`).limit(5),
    sb().from('articles').select('id, title, slug, category, excerpt').eq('status', 'published').is('deleted_at', null).ilike('title', `%${query}%`).limit(5),
  ])

  return {
    colleges: collegesRes.data ?? [],
    courses:  coursesRes.data  ?? [],
    articles: articlesRes.data ?? [],
  }
}
