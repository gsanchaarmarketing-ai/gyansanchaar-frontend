/**
 * Returns the current admission session year.
 *
 * Rule: After 31 December each year the session increments.
 *   Jan 1 – Dec 31, 2026  →  "2026–27"   (admissionYear = 2026)
 *   Jan 1 – Dec 31, 2027  →  "2027–28"   (admissionYear = 2027)
 *
 * Works on both server and client (no browser-only APIs).
 */
export function getAdmissionYear(): number {
  return new Date().getFullYear()
}

/** "2026–27" */
export function getAdmissionSession(): string {
  const y = getAdmissionYear()
  return `${y}–${String(y + 1).slice(-2)}`
}

/** "2026-27" (hyphen, for slugs/meta) */
export function getAdmissionSessionSlug(): string {
  const y = getAdmissionYear()
  return `${y}-${String(y + 1).slice(-2)}`
}

/** "Admissions 2026–27" */
export function getAdmissionLabel(): string {
  return `Admissions ${getAdmissionSession()}`
}
