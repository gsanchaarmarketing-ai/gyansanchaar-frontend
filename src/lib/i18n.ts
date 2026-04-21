import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const c = await cookies()
  const locale = c.get('gs_locale')?.value ?? 'en'
  const validLocales = ['en', 'hi']
  const finalLocale = validLocales.includes(locale) ? locale : 'en'

  return {
    locale: finalLocale,
    messages: (await import(`../../messages/${finalLocale}/index.json`)).default,
  }
})
