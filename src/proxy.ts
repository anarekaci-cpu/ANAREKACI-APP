import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESSION, lireJeton } from '@/lib/auth/token'

/**
 * Proxy (ex-« middleware », renommé dans Next.js 16).
 *
 * Contrôle OPTIMISTE uniquement : on vérifie la signature du cookie pour
 * rediriger vite vers /login. Les vrais contrôles d'accès (rôle, statut du
 * membre, suspension) sont dans la DAL (`lib/auth/dal.ts`), appelée par
 * chaque page et chaque server action.
 */

const PREFIXES_PROTEGES = [
  '/dashboard',
  '/cotisations',
  '/paiements',
  '/formations',
  '/annonces',
  '/evenements',
  '/carte',
  '/messages',
  '/notifications',
  '/profil',
  '/admin',
  '/droit-inscription',
  '/attente-validation',
]
const PAGES_INVITES = ['/login', '/register']

const correspond = (chemin: string, prefixe: string) => chemin === prefixe || chemin.startsWith(`${prefixe}/`)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const connecte = lireJeton(request.cookies.get(COOKIE_SESSION)?.value) !== null

  if (!connecte && PREFIXES_PROTEGES.some((p) => correspond(pathname, p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (connecte && PAGES_INVITES.some((p) => correspond(pathname, p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Exclut l'API, les fichiers internes Next et les fichiers statiques.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|json)$).*)'],
}
