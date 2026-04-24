import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/layout/QueryProvider'
import CookieConsent from '@/components/layout/CookieConsent'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export const metadata: Metadata = {
  title: {
    default: 'GyanSanchaar — India\'s College Application Platform',
    template: '%s | GyanSanchaar',
  },
  description:
    'Apply to 500+ verified colleges across India in under 10 minutes. One form, direct admissions, zero agent fees. DPDP Act 2023 compliant.',
  keywords: ['colleges in India', 'admission 2026', 'college application', 'engineering colleges', 'MBA colleges', 'NIRF ranking', 'NEET colleges', 'JEE colleges'],
  metadataBase: new URL(BASE),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE,
    siteName: 'GyanSanchaar',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'GyanSanchaar' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gyansanchaar',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
            <CookieConsent />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
