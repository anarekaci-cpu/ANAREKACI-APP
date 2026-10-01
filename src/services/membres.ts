import 'server-only'
import { aAccesAdmin, ROLES, type Role } from '@/config/association'
import { hasherMotDePasse, genererMotDePasseTemporaire, verifierMotDePasse } from '@/lib/auth/password'
import { versDTO } from '@/lib/auth/dal'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Database, Membre, StatutMembre } from '@/lib/db/types'
import { TARIFS } from '@/config/association'
import { ko, ok, type Resultat } from './resultat'
import { pousserNotification } from './notifications'

/** Normalise un téléphone saisi : retire espaces, points, tirets ; garde un éventuel + initial. */
export function normaliserTelephone(brut: string): string {
  return brut.trim().replace(/[\s.\-()]/g, '')
}

export const TELEPHONE_REGEX = /^\+?\d{8,15}$/

/** `AN{aa}{0001}` — séquence = plus grand numéro existant de l'année + 1 (et non plus « count + 1 », qui produisait des doublons après une suppression). */
function prochainNumeroMembre(db: Database): string {
  const aa = new Date().getFullYear().toString().slice(-2)
  const prefixe = `AN${aa}`
  const max = db.membres
    .filter((m) => m.numero_membre.startsWith(prefixe))
    .reduce((acc, m) => Math.max(acc, Number(m.numero_membre.slice(prefixe.length)) || 0), 0)
  return `${prefixe}${String(max + 1).padStart(4, '0')}`
}

export function listerMembres(): Membre[] {
  return lire()
    .membres.map(versDTO)
    .sort((a, b) => b.cree_le.localeCompare(a.cree_le))
}

export function trouverMembre(id: string): Membre | null {
  const row = lire().membres.find((m) => m.id === id)
  return row ? versDTO(row) : null
}

export type NouveauMembre = {
  nom: string
  prenoms: string
  sexe: 'homme' | 'femme'
  telephone: string
  commune_quartier: string
  type_activite: string
  motDePasse: string
}

export function inscrireMembre(donnees: NouveauMembre): Resultat<Membre> {
  const telephone = normaliserTelephone(donnees.telephone)
  if (!TELEPHONE_REGEX.test(telephone)) return ko('Numéro de téléphone invalide (8 à 15 chiffres).')
  if (donnees.motDePasse.length < 8) return ko('Mot de passe trop court (8 caractères minimum).')
  const nom = donnees.nom.trim()
  const prenoms = donnees.prenoms.trim()
  if (!nom || !prenoms) return ko('Le nom et les prénoms sont obligatoires.')

  return modifier((db) => {
    if (db.membres.some((m) => m.telephone === telephone)) {
      return ko('Ce numéro est déjà utilisé. Connectez-vous ou contactez le bureau.')
    }
    const horodatage = maintenant()
    const row = {
      id: uid(),
      numero_membre: prochainNumeroMembre(db),
      telephone,
      mot_de_passe_hash: hasherMotDePasse(donnees.motDePasse),
      nom,
      prenoms,
      nom_complet: `${nom} ${prenoms}`,
      email: null,
      sexe: donnees.sexe,
      commune_quartier: donnees.commune_quartier.trim() || null,
      type_activite: donnees.type_activite.trim() || null,
      statut: 'en_attente' as StatutMembre,
      role: 'membre' as Role,
      cree_le: horodatage,
    }
    db.membres.push(row)
    // Le droit d'inscription est créé en même temps que le membre (une seule fois, jamais en doublon).
    db.droits_inscription.push({
      id: uid(),
      membre_id: row.id,
      statut: 'non_paye',
      montant: TARIFS.droitInscription,
      date_paiement: null,
      date_validation: null,
      valide_par: null,
      motif_refus: null,
      cree_le: horodatage,
    })
    pousserNotification(db, row.id, 'Bienvenue', "Réglez votre droit d'inscription pour finaliser votre adhésion.", 'info')
    return ok(versDTO(row))
  })
}

/** Vérifie téléphone + mot de passe. Message volontairement identique dans les deux cas d'échec (ne révèle pas quels numéros existent). */
export function authentifier(telephoneBrut: string, motDePasse: string): Membre | null {
  const telephone = normaliserTelephone(telephoneBrut)
  const row = lire().membres.find((m) => m.telephone === telephone)
  if (!row) {
    // Calcul factice : le temps de réponse ne doit pas révéler si le numéro existe.
    verifierMotDePasse(motDePasse, 'aa:bb')
    return null
  }
  if (!verifierMotDePasse(motDePasse, row.mot_de_passe_hash)) return null
  if (row.statut === 'suspendu') return null
  return versDTO(row)
}

export function changerStatutMembre(membreId: string, statut: StatutMembre): Resultat {
  return modifier((db) => {
    const m = db.membres.find((x) => x.id === membreId)
    if (!m) return ko('Membre introuvable.')
    m.statut = statut
    pousserNotification(
      db,
      m.id,
      'Statut de votre compte',
      statut === 'actif' ? 'Votre compte est actif.' : statut === 'suspendu' ? 'Votre compte a été suspendu.' : 'Votre compte est en attente de validation.',
      statut === 'suspendu' ? 'warning' : 'info'
    )
    return ok(undefined)
  })
}

export function changerRoleMembre(membreId: string, role: string, par: Membre): Resultat {
  if (!(ROLES as readonly string[]).includes(role)) return ko('Rôle invalide.')
  return modifier((db) => {
    const m = db.membres.find((x) => x.id === membreId)
    if (!m) return ko('Membre introuvable.')
    if (m.id === par.id) return ko('Vous ne pouvez pas modifier votre propre rôle.')
    // Seul un administrateur peut nommer ou révoquer un administrateur ou un membre du bureau.
    if (par.role !== 'admin' && (role === 'admin' || role === 'bureau' || m.role === 'admin' || m.role === 'bureau')) {
      return ko('Seul un administrateur peut gérer les rôles « Administrateur » et « Bureau ».')
    }
    // Garde-fou : toujours au moins un administrateur.
    if (m.role === 'admin' && role !== 'admin' && db.membres.filter((x) => x.role === 'admin').length <= 1) {
      return ko('Impossible : il doit rester au moins un administrateur.')
    }
    m.role = role as Role
    pousserNotification(db, m.id, 'Votre rôle a changé', `Votre rôle est maintenant : ${role}.`, 'info')
    return ok(undefined)
  })
}

/** Réinitialisation par l'admin : retourne le mot de passe temporaire (à communiquer au membre). */
export function reinitialiserMotDePasse(membreId: string): Resultat<string> {
  const temporaire = genererMotDePasseTemporaire()
  return modifier((db) => {
    const m = db.membres.find((x) => x.id === membreId)
    if (!m) return ko('Membre introuvable.')
    m.mot_de_passe_hash = hasherMotDePasse(temporaire)
    return ok(temporaire)
  })
}

export function changerMotDePasse(membreId: string, actuel: string, nouveau: string): Resultat {
  if (nouveau.length < 8) return ko('Le nouveau mot de passe doit contenir 8 caractères minimum.')
  return modifier((db) => {
    const m = db.membres.find((x) => x.id === membreId)
    if (!m) return ko('Membre introuvable.')
    if (!verifierMotDePasse(actuel, m.mot_de_passe_hash)) return ko('Mot de passe actuel incorrect.')
    m.mot_de_passe_hash = hasherMotDePasse(nouveau)
    return ok(undefined)
  })
}

export type ModifProfil = {
  nom: string
  prenoms: string
  email: string | null
  commune_quartier: string | null
  type_activite: string | null
}

export function mettreAJourProfil(membreId: string, p: ModifProfil): Resultat {
  const nom = p.nom.trim()
  const prenoms = p.prenoms.trim()
  if (!nom || !prenoms) return ko('Le nom et les prénoms sont obligatoires.')
  if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) return ko('Adresse e-mail invalide.')
  return modifier((db) => {
    const m = db.membres.find((x) => x.id === membreId)
    if (!m) return ko('Membre introuvable.')
    m.nom = nom
    m.prenoms = prenoms
    m.nom_complet = `${nom} ${prenoms}`
    m.email = p.email?.trim() || null
    m.commune_quartier = p.commune_quartier?.trim() || null
    m.type_activite = p.type_activite?.trim() || null
    return ok(undefined)
  })
}

export function membresAvecAccesAdmin(): Membre[] {
  return listerMembres().filter((m) => aAccesAdmin(m.role))
}
