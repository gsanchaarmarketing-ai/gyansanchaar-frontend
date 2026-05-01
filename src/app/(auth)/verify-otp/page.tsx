'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GraduationCap, Mail } from 'lucide-react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'

// Supabase handles email OTP verification via its own magic link flow.
// After signup, Supabase sends a confirmation email. User clicks it or
// enters the token. We just monitor the auth state here.
function VerifyOtpContent() {
  const sp     = useSearchParams()
  const router = useRouter()
  const email  = sp.get('email') ?? ''

  useEffect(() => {
    // Listen for Supabase auth state change (email confirmed)
    const sb = createBrowserSupabaseClient()
    const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        toast.success('Email verified! Redirecting…')
        window.location.href = '/dashboard'
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
      <div className="text-center md:text-left mb-5">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-white text-xl font-bold mb-3">
          <GraduationCap className="w-6 h-6" />GyanSanchaar
        </Link>
        <div className="text-4xl mb-2">📧</div>
        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="text-white/60 text-sm mt-1">
          We sent a verification link to{' '}
          <strong className="text-white break-all">{email}</strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            Click the link in the email to verify your account and go to your dashboard automatically.
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <p>• Check spam/junk folder if not received</p>
          <p>• Link expires in 24 hours</p>
          <p>• Check your email <strong>{email}</strong> is correct</p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-slate-500 mb-2">Already verified?</p>
          <Link href="/login"
            className="block text-center bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  )
}
