import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createNavigation } from 'next-intl/navigation'
import { routing } from '@/i18n/routing'

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && routing.locales.includes(cookie as typeof routing.locales[number])) return cookie

  const acceptLang = request.headers.get('Accept-Language') ?? ''
  for (const locale of routing.locales) {
    if (acceptLang.startsWith(locale)) return locale
  }
  return routing.defaultLocale
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const locale = detectLocale(request)
  if (!request.cookies.has('NEXT_LOCALE')) {
    supabaseResponse.cookies.set('NEXT_LOCALE', locale)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/ruta', '/rincon-familiar', '/herramientas', '/configuracion', '/onboarding', '/comunidad']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/ruta', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
}
