import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value
  const routeLocale = await requestLocale
  const requested = cookieLocale ?? routeLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
