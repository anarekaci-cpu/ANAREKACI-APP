import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { estAdmin } from '@/lib/membres'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const auth = await supabase.auth.getUser()
  const user = auth.data.user
  const pathname = request.nextUrl.pathname

  // Routes protégées
  const protectedPaths = ['/dashboard', '/cotisations', '/formations', '/annonces', '/admin', '/droit-inscription', '/recensement']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Vérifier si l'utilisateur a une fiche membre (sauf pour la page d'attente)
  if (user && pathname !== '/attente-validation') {
    const membreQuery = await supabase
      .from('membres')
      .select('id, role')
      .eq('compte_id', user.id)
      .maybeSingle()

    // Si pas de fiche membre, rediriger vers l'attente
    if (!membreQuery.data) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/attente-validation', request.url))
      }
      // Pour les routes non-admin, on redirige aussi sauf si c'est déjà la page d'attente
      if (!pathname.startsWith('/auth/') && pathname !== '/login' && pathname !== '/register') {
        return NextResponse.redirect(new URL('/attente-validation', request.url))
      }
    }

    // Protection admin
    if (pathname.startsWith('/admin') && membreQuery.data) {
      if (!estAdmin(membreQuery.data.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Routes d'auth (login/register) inaccessibles si connecté
  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
