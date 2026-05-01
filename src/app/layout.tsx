import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/layout/QueryProvider'
import CookieConsent from '@/components/layout/CookieConsent'
import { getCmsContent } from '@/lib/cms'
import { websiteSchema, organizationSchema } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCmsContent('seo').catch(() => ({} as Record<string, string>))
  const title   = content['seo.default_title']   || 'GyanSanchaar — Find Your College. Apply Free. No Agent Fees.'
  const desc    = content['seo.default_description'] || 'Discover colleges and courses across India. Apply directly — no consultants, no hidden fees.'
  const kw      = content['seo.default_keywords']?.split(',').map(s => s.trim()) ?? ['colleges in India','admission 2026','Northeast India colleges','free college application']
  const ogImage = content['seo.og_image'] || '/og-default.png'
  const handle  = content['seo.twitter_handle'] || '@gyansanchaar'
  const tmpl    = content['seo.title_template'] || '%s | GyanSanchaar'

  return {
    metadataBase: new URL(BASE),
    title: { default: title, template: tmpl },
    description: desc,
    keywords: kw,
    authors: [{ name: 'GyanSanchaar', url: BASE }],
    creator: 'GyanSanchaar',
    publisher: 'GyanSanchaar',
    category: 'Education',
    classification: 'Education / College Admissions',
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
    },
    openGraph: {
      type: 'website', locale: 'en_IN', url: BASE,
      siteName: content['seo.site_name'] || 'GyanSanchaar',
      title, description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'GyanSanchaar — Find Your College' }],
    },
    twitter: { card: 'summary_large_image', site: handle, creator: handle, title, description: desc, images: [ogImage] },
    alternates: { canonical: BASE },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
      yandex: process.env.YANDEX_VERIFICATION ?? '',
      other: { 'msvalidate.01': process.env.BING_VERIFICATION ?? '' },
    },
    other: {
      'og:locale:alternate': 'hi_IN',
      'revisit-after': '7 days',
      rating: 'general',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://iwgsqaezapwxhjadnfvm.supabase.co" />
        {/* JSON-LD: Website + Organization — on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
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
