// Shared types — all data from Supabase via supabase-api.ts and student-api.ts

export interface Profile {
  id: string
  name: string
  father_name: string | null
  phone: string | null
  phone_verified_at: string | null
  dob: string | null
  is_minor: boolean
  address: string | null
  state_id: number | null
  city: string | null
  pincode: string | null
  category: string | null
  role: string
  consent_at: string | null
  parental_consent_verified: boolean
  created_at: string
  email?: string
}

export interface College {
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

export interface Course {
  id: number
  name: string
  slug: string
  level: string
  duration_months: number
  default_fee: number | null
  description: string | null
  stream: { name: string } | null
}

export interface Article {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views: number
  reading_time: number | null
}

export interface State {
  id: number
  name: string
  slug: string
  region?: string
}

export interface Stream {
  id: number
  name: string
  short: string
  slug: string
}

export interface Application {
  id: number
  status: string
  branch: string | null
  interview_at: string | null
  admission_letter_path: string | null
  created_at: string
  college: { id: number; name: string; slug: string; city: string } | null
  course: { id: number; name: string; level: string } | null
}

export interface Document {
  id: number
  type: string
  path: string
  original_filename: string
  size_bytes: number
  created_at: string
}

export type ConsentState = Record<string, boolean>

export interface Paginated<T> {
  data: T[]
  count: number
}
