/**
 * GyanSanchaar API client.
 * Sends Bearer token (stored in httpOnly cookie via Next.js route handler).
 * Works server-side (SSR) and client-side.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown>,
  ) {
    super(typeof data.message === 'string' ? data.message : 'API error')
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  })

  if (!res.ok) {
    let data: Record<string, unknown> = {}
    try { data = await res.json() } catch {}
    throw new ApiError(res.status, data)
  }

  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}

// ── Public (no auth) ─────────────────────────────────────────────────────────

export const publicApi = {
  colleges: (params?: Record<string, string>) =>
    request<CollegesResponse>(`/public/colleges?${new URLSearchParams(params)}`),

  college: (slug: string) =>
    request<{ data: College }>(`/public/colleges/${slug}`),

  courses: (params?: Record<string, string>) =>
    request<CoursesResponse>(`/public/courses?${new URLSearchParams(params)}`),

  course: (slug: string) =>
    request<{ data: Course }>(`/public/courses/${slug}`),

  articles: (params?: Record<string, string>) =>
    request<ArticlesResponse>(`/public/articles?${new URLSearchParams(params)}`),

  article: (slug: string) =>
    request<{ data: Article }>(`/public/articles/${slug}`),

  states: () => request<{ data: State[] }>('/public/states', { next: { revalidate: 86400 } }),

  streams: () => request<{ data: Stream[] }>('/public/streams', { next: { revalidate: 86400 } }),

  exams: () => request<ExamsResponse>('/public/exams'),

  grievanceOfficer: () => request<GrievanceOfficer>('/public/grievance-officer'),

  grievanceStatus: (ticket: string) =>
    request<GrievanceStatus>(`/student/grievance/${ticket}`),
}

// ── Student (requires token) ──────────────────────────────────────────────────

export const studentApi = {
  register: (data: RegisterPayload) =>
    request<AuthResponse>('/student/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    request<AuthResponse>('/student/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendOtp: (data: OtpSendPayload) =>
    request<OtpSendResponse>('/student/otp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: OtpVerifyPayload) =>
    request<OtpVerifyResponse>('/student/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    request<MeResponse>('/student/me', { token }),

  updateProfile: (token: string, data: Partial<UserProfile>) =>
    request<{ data: User }>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  dataSummary: (token: string) =>
    request<DataSummary>('/student/me/data-summary', { token }),

  requestErasure: (token: string) =>
    request<{ message: string; ticket_id: string }>('/student/me/erasure', {
      method: 'POST',
      token,
    }),

  updateConsent: (token: string, data: ConsentUpdate) =>
    request<{ consent_state: ConsentState }>('/student/me/consent', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  parentalConsentStatus: (token: string) =>
    request<ParentalConsentStatus>('/student/parental-consent', { token }),

  initiateParentalConsent: (token: string, data: ParentInitPayload) =>
    request<{ message: string; parent_phone_masked: string }>(
      '/student/parental-consent/initiate',
      { method: 'POST', body: JSON.stringify(data), token },
    ),

  verifyParentalConsent: (token: string, code: string) =>
    request<{ message: string; user: Partial<User> }>(
      '/student/parental-consent/verify',
      { method: 'POST', body: JSON.stringify({ code }), token },
    ),

  applications: (token: string) =>
    request<ApplicationsResponse>('/student/applications', { token }),

  application: (token: string, id: number) =>
    request<{ data: Application }>(`/student/applications/${id}`, { token }),

  applyToCollege: (token: string, data: ApplyPayload) =>
    request<{ data: Application }>('/student/applications', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  withdrawApplication: (token: string, id: number) =>
    request<{ message: string }>(`/student/applications/${id}/withdraw`, {
      method: 'POST',
      token,
    }),

  documents: (token: string) =>
    request<{ data: Document[] }>('/student/documents', { token }),

  uploadDocument: (token: string, formData: FormData) =>
    request<{ data: Document }>('/student/documents', {
      method: 'POST',
      body: formData,
      token,
    }),

  deleteDocument: (token: string, id: number) =>
    request<{ message: string }>(`/student/documents/${id}`, {
      method: 'DELETE',
      token,
    }),

  documentDownload: (token: string, id: number) =>
    request<{ url: string }>(`/student/documents/${id}/download`, { token }),

  fileGrievance: (data: GrievancePayload) =>
    request<{ message: string; ticket_id: string }>('/student/grievance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    request<{ message: string }>('/student/logout', {
      method: 'POST',
      token,
    }),
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  phone_verified_at: string | null
  is_minor: boolean
  parental_consent_verified: boolean
  role: string
  dob: string | null
  father_name: string | null
  address: string | null
  city: string | null
  state_id: number | null
}

export interface College {
  id: number
  name: string
  slug: string
  type: string
  city: string
  state: State | null
  nirf_rank: number | null
  naac_grade: string | null
  approvals: string | null
  about: string | null
  logo_path: string | null
  courses?: Course[]
  streams?: Stream[]
}

export interface Course {
  id: number
  name: string
  slug: string
  level: string
  duration_months: number
  stream: Stream | null
  default_fee: number
}

export interface Article {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string | null
  body: string | null
  body_html: string | null
  featured_image: string | null
  published_at: string | null
  reading_time: number | null
  author: { id: number; name: string } | null
  meta_title: string | null
  meta_description: string | null
}

export interface State { id: number; name: string; slug: string; iso_code: string }
export interface Stream { id: number; name: string; short: string; slug: string; icon: string | null }

export interface Application {
  id: number
  college: College
  course: Course
  branch: string | null
  status: string
  interview_at: string | null
  admission_letter_path: string | null
  created_at: string
}

export interface Document {
  id: number
  type: string
  original_filename: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export type CollegesResponse = Paginated<College>
export type CoursesResponse = Paginated<Course>
export type ArticlesResponse = Paginated<Article>
export type ExamsResponse = Paginated<{ id: number; name: string; slug: string; level: string; exam_date: string | null }>
export type ApplicationsResponse = Paginated<Application>

export interface AuthResponse {
  user: User
  token: string
  requires_otp?: boolean
  is_minor?: boolean
  parental_consent_required?: boolean
  otp_expires_at?: string
}

export interface MeResponse {
  user: User
  consent_state: ConsentState
  can_submit_application: boolean
}

export interface ConsentState {
  application: boolean
  communication: boolean
  marketing: boolean
  analytics: boolean
}

export interface ConsentUpdate { purpose: string; action: 'grant' | 'withdraw' }
export interface DataSummary { personal_info: Partial<User>; consents: ConsentState; applications_count: number; documents_count: number }
export interface ParentalConsentStatus { is_minor: boolean; parental_consent_verified: boolean; parent: { parent_name: string; verified_at: string } | null }
export interface ParentInitPayload { parent_name: string; parent_relationship: string; parent_phone: string; parent_email?: string }
export interface GrievanceOfficer { name: string; email: string; phone: string; ack_sla_hours: number; resolve_sla_days: number }
export interface GrievanceStatus { ticket_id: string; status: string; created_at: string; sla_due_at: string; is_overdue: boolean }
export interface GrievancePayload { complainant_name: string; complainant_email: string; complainant_phone?: string; category: string; subject: string; description: string }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; password_confirmation: string; dob?: string; consents: Record<string, boolean>; policy_version: string }
export interface LoginPayload { email: string; password: string }
export interface OtpSendPayload { identifier: string; type: 'phone' | 'email'; purpose: string; channel?: string }
export interface OtpSendResponse { message: string; expires_at: string; channel: string }
export interface OtpVerifyPayload { identifier: string; purpose: string; code: string }
export interface OtpVerifyResponse { message: string; user?: User; token?: string }
export interface ApplyPayload { college_id: number; course_id: number; branch?: string }
export interface UserProfile { name: string; father_name: string; alt_phone: string; address: string; state_id: number; city: string; pincode: string; dob: string }
