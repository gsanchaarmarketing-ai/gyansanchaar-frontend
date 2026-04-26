import { redirect } from 'next/navigation'

// Counsellors are now college-specific — assigned from the admin panel per college.
// This page is no longer needed. Redirect to colleges listing.
export default function CounsellorsPage() {
  redirect('/colleges')
}
