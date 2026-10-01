'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { changerRoleMembre, changerStatutMembre, reinitialiserMotDePasse as reinitialiser, trouverMembre } from '@/services/membres'
import { encaisserCotisations } from '@/services/paiements'
import type { StatutMembre } from '@/lib/db/types'
import { COOKIE_RESET } from './constantes'


const STATUTS: StatutMembre[] = ['actif', 'en_attente', 'suspendu']

export async function changerStatut(formData: FormData) {
  const admin = await exigerPermission('membres')
  const id = String(formData.get('membreId') ?? '')
  const statut = String(formData.get('statut') ?? '') as StatutMembre
  if (!STATUTS.includes(statut)) aller('/admin/membres', { erreur: 'Statut invalide.' })
  if (id === admin.id && statut === 'suspendu') aller('/admin/membres', { erreur: 'Vous ne pouvez pas vous suspendre vous-même.' })

  const r = changerStatutMembre(id, statut)
  revalidatePath('/admin/membres')
  if (!r.ok) aller('/admin/membres', { erreur: r.erreur })
  aller('/admin/membres', { succes: 'Statut mis à jour.' })
}

/**
 * Le mot de passe temporaire est transmis à la page par un cookie httpOnly qui expire en 60 s,
 * pas dans l'URL (une URL finit dans l'historique du navigateur et dans les journaux du serveur).
 */
export async function reinitialiserMotDePasse(formData: FormData) {
  await exigerPermission('membres')
  const id = String(formData.get('membreId') ?? '')
  const membre = trouverMembre(id)
  const r = reinitialiser(id)
  if (!r.ok || !membre) aller('/admin/membres', { erreur: r.ok ? 'Membre introuvable.' : r.erreur })

  const store = await cookies()
  store.set(COOKIE_RESET, encodeURIComponent(JSON.stringify({ nom: membre.nom_complet, motDePasse: r.data })), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin/membres',
    maxAge: 60,
  })
  aller('/admin/membres')
}

export async function changerRole(formData: FormData) {
  const admin = await exigerPermission('membres')
  const r = changerRoleMembre(String(formData.get('membreId') ?? ''), String(formData.get('role') ?? ''), admin)
  revalidatePath('/admin/roles')
  if (!r.ok) aller('/admin/roles', { erreur: r.erreur })
  aller('/admin/roles', { succes: 'Rôle mis à jour.' })
}

/** Encaissement au guichet (espèces…) saisi par le trésorier : validé immédiatement. */
export async function encaisser(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const membreId = String(formData.get('membreId') ?? '')
  const annee = Number(formData.get('annee'))
  const r = encaisserCotisations(
    admin.id,
    membreId,
    annee,
    formData.getAll('mois').map(Number),
    String(formData.get('methode') ?? ''),
    String(formData.get('reference') ?? '') || null
  )
  const retour = `/admin/membres/${membreId}`
  revalidatePath(retour)
  if (!r.ok) aller(retour, { erreur: r.erreur })
  aller(retour, { succes: `${r.data.crees} cotisation(s) encaissée(s).` })
}
