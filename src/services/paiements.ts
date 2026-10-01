import 'server-only'
import { METHODES_PAIEMENT, TARIFS, type MethodePaiement } from '@/config/association'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Database, Membre, Paiement, StatutPaiement, TypePaiement } from '@/lib/db/types'
import { versDTO } from '@/lib/auth/dal'
import { ko, ok, type Resultat } from './resultat'
import { pousserNotification } from './notifications'
import { assurerCotisations } from './cotisations'
import { refuserDroitDansDb, validerDroitDansDb } from './droits'

export type PaiementAvecMembre = Paiement & { membre: Membre | null }

function joindre(db: Readonly<Database>, liste: Paiement[]): PaiementAvecMembre[] {
  return liste
    .map((p) => {
      const row = db.membres.find((m) => m.id === p.membre_id)
      return { ...p, membre: row ? versDTO(row) : null }
    })
    .sort((a, b) => b.cree_le.localeCompare(a.cree_le))
}

export function listerPaiements(filtre: { statut?: StatutPaiement; type?: TypePaiement } = {}): PaiementAvecMembre[] {
  const db = lire()
  return joindre(
    db,
    db.paiements.filter((p) => (!filtre.statut || p.statut === filtre.statut) && (!filtre.type || p.type === filtre.type))
  )
}

export function paiementsDuMembre(membreId: string): PaiementAvecMembre[] {
  const db = lire()
  return joindre(db, db.paiements.filter((p) => p.membre_id === membreId))
}

export function trouverPaiement(id: string): PaiementAvecMembre | null {
  const db = lire()
  const p = db.paiements.find((x) => x.id === id)
  return p ? joindre(db, [p])[0] : null
}

function verifierMois(annee: number, mois: number[]): string | null {
  const courante = new Date().getFullYear()
  if (!Number.isInteger(annee) || annee < courante - 5 || annee > courante + 1) return 'Année invalide.'
  if (mois.length === 0) return 'Sélectionnez au moins un mois.'
  if (mois.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) return 'Mois invalide.'
  return null
}

function creerPaiementsCotisation(
  db: Database,
  membreId: string,
  annee: number,
  mois: number[],
  methode: MethodePaiement,
  reference: string | null,
  statut: StatutPaiement,
  parId: string | null
): { crees: number; ignores: number } {
  const horodatage = maintenant()
  let crees = 0
  let ignores = 0
  assurerCotisations(db, membreId, annee)

  for (const m of [...new Set(mois)]) {
    const cotisation = db.cotisations.find((c) => c.membre_id === membreId && c.annee === annee && c.mois === m)!
    const dejaEnAttente = db.paiements.some(
      (p) => p.membre_id === membreId && p.type === 'cotisation' && p.annee === annee && p.mois === m && p.statut === 'en_attente'
    )
    // Un mois déjà payé ou déjà déclaré ne peut pas être payé deux fois.
    if (cotisation.statut === 'paye' || dejaEnAttente) {
      ignores++
      continue
    }
    db.paiements.push({
      id: uid(),
      membre_id: membreId,
      type: 'cotisation',
      montant: TARIFS.cotisationMensuelle, // jamais lu depuis le navigateur
      methode,
      reference,
      mois: m,
      annee,
      statut,
      date_paiement: horodatage,
      date_validation: statut === 'valide' ? horodatage : null,
      valide_par: statut === 'valide' ? parId : null,
      cree_le: horodatage,
    })
    if (statut === 'valide') {
      cotisation.statut = 'paye'
      cotisation.date_paiement = horodatage
    }
    crees++
  }
  return { crees, ignores }
}

function methodeValide(m: string): m is MethodePaiement {
  return (METHODES_PAIEMENT as readonly string[]).includes(m)
}

/** Le membre déclare avoir payé ces mois : paiements « en attente » jusqu'à validation du trésorier. */
export function declarerCotisations(
  membreId: string,
  annee: number,
  mois: number[],
  methode: string,
  reference: string | null
): Resultat<{ crees: number; ignores: number }> {
  const erreur = verifierMois(annee, mois)
  if (erreur) return ko(erreur)
  if (!methodeValide(methode)) return ko('Méthode de paiement invalide.')

  return modifier((db) => {
    const r = creerPaiementsCotisation(db, membreId, annee, mois, methode, reference?.trim() || null, 'en_attente', null)
    if (r.crees === 0) return ko('Ces mois sont déjà payés ou en attente de validation.')
    return ok(r)
  })
}

/** Le trésorier/bureau encaisse directement (espèces au guichet) : paiement validé immédiatement. */
export function encaisserCotisations(
  parId: string,
  membreId: string,
  annee: number,
  mois: number[],
  methode: string,
  reference: string | null
): Resultat<{ crees: number; ignores: number }> {
  const erreur = verifierMois(annee, mois)
  if (erreur) return ko(erreur)
  if (!methodeValide(methode)) return ko('Méthode de paiement invalide.')

  return modifier((db) => {
    if (!db.membres.some((m) => m.id === membreId)) return ko('Membre introuvable.')
    const r = creerPaiementsCotisation(db, membreId, annee, mois, methode, reference?.trim() || null, 'valide', parId)
    if (r.crees === 0) return ko('Ces mois sont déjà payés ou en attente.')
    pousserNotification(db, membreId, 'Paiement enregistré', `${r.crees} cotisation(s) enregistrée(s) pour ${annee}.`, 'success')
    return ok(r)
  })
}

export function validerPaiementDansDb(db: Database, paiementId: string, parId: string | null): Resultat {
  const p = db.paiements.find((x) => x.id === paiementId)
  if (!p) return ko('Paiement introuvable.')
  if (p.statut === 'valide') return ok(undefined) // idempotent
  if (p.statut === 'refuse') return ko('Ce paiement a été refusé.')

  const horodatage = maintenant()
  p.statut = 'valide'
  p.date_validation = horodatage
  p.valide_par = parId

  if (p.type === 'droit_inscription') {
    return validerDroitDansDb(db, p.membre_id, parId)
  }

  if (p.annee && p.mois) {
    assurerCotisations(db, p.membre_id, p.annee)
    const c = db.cotisations.find((x) => x.membre_id === p.membre_id && x.annee === p.annee && x.mois === p.mois)
    if (c) {
      c.statut = 'paye'
      c.date_paiement = horodatage
    }
    pousserNotification(db, p.membre_id, 'Cotisation validée', `Votre cotisation ${String(p.mois).padStart(2, '0')}/${p.annee} est validée.`, 'success')
  }
  return ok(undefined)
}

export function validerPaiement(paiementId: string, parId: string): Resultat {
  return modifier((db) => validerPaiementDansDb(db, paiementId, parId))
}

export function refuserPaiement(paiementId: string, parId: string, motif?: string): Resultat {
  return modifier((db) => {
    const p = db.paiements.find((x) => x.id === paiementId)
    if (!p) return ko('Paiement introuvable.')
    if (p.statut !== 'en_attente') return ko('Seul un paiement en attente peut être refusé.')
    const raison = motif?.trim() || 'Paiement non confirmé par le trésorier'
    if (p.type === 'droit_inscription') return refuserDroitDansDb(db, p.membre_id, parId, raison)
    p.statut = 'refuse'
    p.date_validation = maintenant()
    p.valide_par = parId
    pousserNotification(db, p.membre_id, 'Paiement refusé', raison, 'error')
    return ok(undefined)
  })
}

/** Utilisé par la notification CinetPay (après vérification auprès de CinetPay). */
export function validerParReference(reference: string): Resultat {
  return modifier((db) => {
    const p = db.paiements.find((x) => x.reference === reference)
    if (!p) return ko('Transaction inconnue.')
    return validerPaiementDansDb(db, p.id, null)
  })
}
