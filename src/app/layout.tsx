import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/layout/QueryProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'GyanSanchaar — Find Your College',
    template: '%s | GyanSanchaar',
  },
  description:
    'Discover colleges, courses, and exams across India. Apply to multiple colleges with one application form.',
  keywords: ['colleges in India', 'admission 2025', 'courses', 'engineering colleges', 'MBA colleges'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gyansanchaar.cloud',
    siteName: 'GyanSanchaar',
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
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
