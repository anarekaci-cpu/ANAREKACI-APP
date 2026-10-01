import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { aAccesAdmin, aPermission, type Permission } from '@/config/association'
import { lire } from '@/lib/db/store'
import type { Membre, MembreRow } from '@/lib/db/types'
import { COOKIE_SESSION, lireJeton } from './token'

/**
 * DAL — Data Access Layer. C'est ICI (et pas dans le proxy) que se font les
 * vraies vérifications d'accès, comme le recommande la doc Next.js : le proxy
 * ne fait qu'un contrôle optimiste, car les Server Actions sont des requêtes
 * POST qu'un proxy mal configuré pourrait laisser passer.
 *
 * Chaque page / server action protégée appelle `exigerMembre()` ou
 * `exigerAdmin()` en premier.
 */

/** Retire le hash du mot de passe : seul ce DTO est transmis aux pages. */
export function versDTO(row: MembreRow): Membre {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mot_de_passe_hash, ...membre } = row
  return membre
}

/** Membre connecté, ou null. Mis en cache pour la durée d'une requête. */
export const membreCourant = cache(async (): Promise<Membre | null> => {
  const store = await cookies()
  const id = lireJeton(store.get(COOKIE_SESSION)?.value)
  if (!id) return null

  const row = lire().membres.find((m) => m.id === id)
  // Un compte supprimé ou suspendu perd immédiatement l'accès, même avec un cookie valide.
  if (!row || row.statut === 'suspendu') return null
  return versDTO(row)
})

export async function exigerMembre(): Promise<Membre> {
  const membre = await membreCourant()
  if (!membre) redirect('/login')
  return membre
}

/** Membre dont l'inscription a été validée (statut actif). */
export async function exigerMembreActif(): Promise<Membre> {
  const membre = await exigerMembre()
  if (membre.statut !== 'actif' && !aAccesAdmin(membre.role)) redirect('/attente-validation')
  return membre
}

/** Accès à l'espace d'administration (tout rôle autre que « membre »). */
export async function exigerAccesAdmin(): Promise<Membre> {
  const membre = await exigerMembre()
  if (!aAccesAdmin(membre.role)) redirect('/dashboard')
  return membre
}

/** Accès à une fonction précise (ex. 'paiements' pour le trésorier). */
export async function exigerPermission(permission: Permission): Promise<Membre> {
  const membre = await exigerMembre()
  if (!aPermission(membre.role, permission)) redirect(aAccesAdmin(membre.role) ? '/admin' : '/dashboard')
  return membre
}
