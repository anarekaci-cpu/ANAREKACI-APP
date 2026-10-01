import 'server-only'
import { cookies } from 'next/headers'
import { COOKIE_SESSION, DUREE_SESSION_SECONDES, creerJeton } from './token'

export async function ouvrirSession(membreId: string) {
  const store = await cookies()
  store.set(COOKIE_SESSION, creerJeton(membreId), {
    httpOnly: true, // illisible par JavaScript → protège contre le vol par XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // bloque l'envoi du cookie depuis un site tiers (CSRF)
    path: '/',
    maxAge: DUREE_SESSION_SECONDES,
  })
}

export async function fermerSession() {
  const store = await cookies()
  store.delete(COOKIE_SESSION)
}
