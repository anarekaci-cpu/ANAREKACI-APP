import 'server-only'
import { METHODES_PAIEMENT, TARIFS, type MethodePaiement } from '@/config/association'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Database, DroitInscription, Membre } from '@/lib/db/types'
import { versDTO } from '@/lib/auth/dal'
import { ko, ok, type Resultat } from './resultat'
import { pousserNotification } from './notifications'
import { assurerCotisations } from './cotisations'

export function droitDuMembre(membreId: string): DroitInscription | null {
  return lire().droits_inscription.find((d) => d.membre_id === membreId) ?? null
}

export type DroitAvecMembre = DroitInscription & { membre: Membre | null }

export function listerDroits(): DroitAvecMembre[] {
  const db = lire()
  return db.droits_inscription
    .map((d) => {
      const row = db.membres.find((m) => m.id === d.membre_id)
      return { ...d, membre: row ? versDTO(row) : null }
    })
    .sort((a, b) => b.cree_le.localeCompare(a.cree_le))
}

/**
 * Le membre DÉCLARE un paiement ; seul le bureau/trésorier le valide.
 * Ancien comportement (faille) : `enregistrerPaiementDroitInscription` validait
 * le paiement tout seul, avec un montant envoyé par le navigateur — n'importe
 * quel membre pouvait donc devenir « actif » gratuitement en envoyant une
 * requête. Ici le montant vient de la config serveur et le statut reste
 * « en attente de validation ».
 */
export function declarerPaiementDroit(
  membreId: string,
  methode: string,
  reference: string | null
): Resultat {
  if (!(METHODES_PAIEMENT as readonly string[]).includes(methode)) return ko('Méthode de paiement invalide.')

  return modifier((db) => {
    const droit = db.droits_inscription.find((d) => d.membre_id === membreId)
    if (!droit) return ko("Droit d'inscription introuvable.")
    if (droit.statut === 'paye') return ko("Votre droit d'inscription est déjà réglé.")
    if (droit.statut === 'en_attente_validation') return ko('Une déclaration est déjà en cours de validation.')

    const horodatage = maintenant()
    droit.statut = 'en_attente_validation'
    droit.date_paiement = horodatage
    droit.motif_refus = null
    db.paiements.push({
      id: uid(),
      membre_id: membreId,
      type: 'droit_inscription',
      montant: TARIFS.droitInscription,
      methode: methode as MethodePaiement,
      reference: reference?.trim() || null,
      mois: null,
      annee: null,
      statut: 'en_attente',
      date_paiement: horodatage,
      date_validation: null,
      valide_par: null,
      cree_le: horodatage,
    })
    return ok(undefined)
  })
}

/** Validation réalisée DANS une transaction `modifier()` existante (partagée avec la validation d'un paiement). */
export function validerDroitDansDb(db: Database, membreId: string, parId: string | null): Resultat {
  const droit = db.droits_inscription.find((d) => d.membre_id === membreId)
  const membre = db.membres.find((m) => m.id === membreId)
  if (!droit || !membre) return ko('Droit ou membre introuvable.')
  if (droit.statut === 'paye') return ok(undefined) // idempotent : une 2e notification ne casse rien

  const horodatage = maintenant()
  droit.statut = 'paye'
  droit.date_validation = horodatage
  droit.valide_par = parId
  droit.motif_refus = null
  if (membre.statut === 'en_attente') membre.statut = 'actif'

  // Solde les paiements « droit » encore en attente pour ce membre.
  for (const p of db.paiements) {
    if (p.membre_id === membreId && p.type === 'droit_inscription' && p.statut === 'en_attente') {
      p.statut = 'valide'
      p.date_validation = horodatage
      p.valide_par = parId
    }
  }
  assurerCotisations(db, membreId, new Date().getFullYear())
  pousserNotification(db, membreId, 'Adhésion validée', "Votre droit d'inscription est validé. Bienvenue dans l'association !", 'success')
  return ok(undefined)
}

export function validerDroit(droitId: string, parId: string): Resultat {
  return modifier((db) => {
    const droit = db.droits_inscription.find((d) => d.id === droitId)
    if (!droit) return ko('Droit introuvable.')
    return validerDroitDansDb(db, droit.membre_id, parId)
  })
}

export function refuserDroitDansDb(db: Database, membreId: string, parId: string | null, motif: string): Resultat {
  const droit = db.droits_inscription.find((d) => d.membre_id === membreId)
  if (!droit) return ko('Droit introuvable.')
  if (droit.statut === 'paye') return ko('Ce droit est déjà validé : impossible de le refuser.')
  const horodatage = maintenant()
  droit.statut = 'refuse'
  droit.motif_refus = motif
  droit.valide_par = parId
  droit.date_validation = horodatage
  for (const p of db.paiements) {
    if (p.membre_id === membreId && p.type === 'droit_inscription' && p.statut === 'en_attente') {
      p.statut = 'refuse'
      p.date_validation = horodatage
      p.valide_par = parId
    }
  }
  pousserNotification(db, membreId, "Droit d'inscription refusé", motif, 'error')
  return ok(undefined)
}

export function refuserDroit(droitId: string, parId: string, motif?: string): Resultat {
  return modifier((db) => {
    const droit = db.droits_inscription.find((d) => d.id === droitId)
    if (!droit) return ko('Droit introuvable.')
    return refuserDroitDansDb(db, droit.membre_id, parId, motif?.trim() || 'Paiement non confirmé par l\'administration')
  })
}
