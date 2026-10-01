import 'server-only'
import { MOIS_NOMS, TARIFS } from '@/config/association'
import { lire, maintenant, modifier, uid } from '@/lib/db/store'
import { pousserNotification } from './notifications'
import type { Cotisation, Database } from '@/lib/db/types'

/** Crée les 12 lignes mensuelles manquantes (à appeler dans un `modifier()`). Idempotent. */
export function assurerCotisations(db: Database, membreId: string, annee: number) {
  for (let mois = 1; mois <= 12; mois++) {
    if (!db.cotisations.some((c) => c.membre_id === membreId && c.annee === annee && c.mois === mois)) {
      db.cotisations.push({
        id: uid(),
        membre_id: membreId,
        annee,
        mois,
        statut: 'non_paye',
        montant: TARIFS.cotisationMensuelle,
        date_paiement: null,
        cree_le: maintenant(),
      })
    }
  }
}

export type EtatMois = 'paye' | 'en_attente' | 'non_paye'

export type LigneCotisation = {
  mois: number
  statut: EtatMois
  montant: number
  date_paiement: string | null
  cotisation: Cotisation | null
}

/**
 * Grille de 12 mois pour un membre. L'état est dérivé des paiements :
 * « payé » si la cotisation est soldée, « en attente » si un paiement
 * déclaré attend la validation du trésorier, sinon « non payé ».
 */
export function grilleCotisations(membreId: string, annee: number): LigneCotisation[] {
  const db = lire()
  return Array.from({ length: 12 }, (_, i) => {
    const mois = i + 1
    const cotisation = db.cotisations.find((c) => c.membre_id === membreId && c.annee === annee && c.mois === mois) ?? null
    const enAttente = db.paiements.some(
      (p) => p.membre_id === membreId && p.type === 'cotisation' && p.annee === annee && p.mois === mois && p.statut === 'en_attente'
    )
    const statut: EtatMois = cotisation?.statut === 'paye' ? 'paye' : enAttente ? 'en_attente' : 'non_paye'
    return {
      mois,
      statut,
      // Un mois soldé garde le montant réellement versé ; un mois à payer suit toujours le tarif en vigueur.
      montant: cotisation?.statut === 'paye' ? cotisation.montant : TARIFS.cotisationMensuelle,
      date_paiement: cotisation?.date_paiement ?? null,
      cotisation,
    }
  })
}

export function resumeCotisations(membreId: string, annee: number) {
  const grille = grilleCotisations(membreId, annee)
  const payes = grille.filter((l) => l.statut === 'paye')
  return {
    grille,
    nbPayes: payes.length,
    nbEnAttente: grille.filter((l) => l.statut === 'en_attente').length,
    totalPaye: payes.reduce((s, l) => s + l.montant, 0),
    resteAPayer: grille.filter((l) => l.statut === 'non_paye').reduce((s, l) => s + l.montant, 0),
  }
}

/** Années proposées dans les sélecteurs : de l'année d'adhésion de l'association à l'année courante. */
export function anneesDisponibles(): number[] {
  const courante = new Date().getFullYear()
  return [courante, courante - 1, courante - 2]
}

/**
 * Rappel de cotisation : notifie les membres actifs qui n'ont ni payé ni déclaré le mois donné.
 * Anti-spam : un membre déjà relancé dans les dernières 24 h est ignoré.
 */
export function envoyerRappelsCotisation(annee: number, mois: number): number {
  return modifier((db) => {
    const il_y_a_24h = Date.now() - 24 * 3600 * 1000
    let envoyes = 0
    for (const m of db.membres) {
      if (m.statut !== 'actif' || m.role !== 'membre') continue
      const paye = db.cotisations.some((c) => c.membre_id === m.id && c.annee === annee && c.mois === mois && c.statut === 'paye')
      const attente = db.paiements.some((p) => p.membre_id === m.id && p.type === 'cotisation' && p.annee === annee && p.mois === mois && p.statut === 'en_attente')
      const relance = db.notifications.some((n) => n.membre_id === m.id && n.titre === 'Rappel de cotisation' && Date.parse(n.cree_le) > il_y_a_24h)
      if (paye || attente || relance) continue
      pousserNotification(db, m.id, 'Rappel de cotisation', `Votre cotisation de ${MOIS_NOMS[mois - 1]} ${annee} n'est pas encore réglée (${TARIFS.cotisationMensuelle} FCFA).`, 'warning')
      envoyes++
    }
    return envoyes
  })
}
