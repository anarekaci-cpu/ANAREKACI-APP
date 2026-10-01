import 'server-only'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Annonce, Evenement, Formation, Membre } from '@/lib/db/types'
import { versDTO } from '@/lib/auth/dal'
import { ko, ok, type Resultat } from './resultat'
import { pousserNotification } from './notifications'

/* ───────────── Annonces ───────────── */

export function annoncesPubliees(): Annonce[] {
  return lire()
    .annonces.filter((a) => a.publie)
    .sort((a, b) => Number(b.epingle) - Number(a.epingle) || (b.publie_le ?? b.cree_le).localeCompare(a.publie_le ?? a.cree_le))
}

export function toutesLesAnnonces(): Annonce[] {
  return [...lire().annonces].sort((a, b) => b.cree_le.localeCompare(a.cree_le))
}

export function creerAnnonce(auteurId: string, d: { titre: string; contenu: string; epingle: boolean; publie: boolean }): Resultat {
  const titre = d.titre.trim()
  const contenu = d.contenu.trim()
  if (!titre || !contenu) return ko('Le titre et le contenu sont obligatoires.')
  return modifier((db) => {
    const t = maintenant()
    db.annonces.push({ id: uid(), titre, contenu, epingle: d.epingle, publie: d.publie, publie_le: d.publie ? t : null, cree_le: t, auteur_id: auteurId })
    if (d.publie) {
      for (const m of db.membres) if (m.statut === 'actif') pousserNotification(db, m.id, 'Nouvelle annonce', titre, 'info')
    }
    return ok(undefined)
  })
}

export function basculerAnnonce(id: string, champ: 'epingle' | 'publie'): Resultat {
  return modifier((db) => {
    const a = db.annonces.find((x) => x.id === id)
    if (!a) return ko('Annonce introuvable.')
    a[champ] = !a[champ]
    if (champ === 'publie' && a.publie && !a.publie_le) a.publie_le = maintenant()
    return ok(undefined)
  })
}

export function supprimerAnnonce(id: string): Resultat {
  return modifier((db) => {
    db.annonces = db.annonces.filter((a) => a.id !== id)
    return ok(undefined)
  })
}

/* ───────────── Événements ───────────── */

export function listerEvenements(): Evenement[] {
  return [...lire().evenements].sort((a, b) => a.date_debut.localeCompare(b.date_debut))
}

const TYPES_EVENEMENT: Evenement['type'][] = ['reunion', 'assemblee', 'formation', 'evenement']

export function creerEvenement(
  parId: string,
  d: { titre: string; description: string | null; lieu: string | null; date_debut: string; date_fin: string | null; type: string }
): Resultat {
  if (!d.titre.trim()) return ko('Le titre est obligatoire.')
  if (!d.date_debut || Number.isNaN(Date.parse(d.date_debut))) return ko('Date de début invalide.')
  if (d.date_fin && Date.parse(d.date_fin) < Date.parse(d.date_debut)) return ko('La date de fin précède la date de début.')
  const type = (TYPES_EVENEMENT as string[]).includes(d.type) ? (d.type as Evenement['type']) : 'evenement'
  return modifier((db) => {
    db.evenements.push({
      id: uid(),
      titre: d.titre.trim(),
      description: d.description?.trim() || null,
      lieu: d.lieu?.trim() || null,
      date_debut: new Date(d.date_debut).toISOString(),
      date_fin: d.date_fin ? new Date(d.date_fin).toISOString() : null,
      type,
      cree_par: parId,
      cree_le: maintenant(),
    })
    return ok(undefined)
  })
}

export function supprimerEvenement(id: string): Resultat {
  return modifier((db) => {
    db.evenements = db.evenements.filter((e) => e.id !== id)
    return ok(undefined)
  })
}

/* ───────────── Formations ───────────── */

export function listerFormations(): Formation[] {
  return [...lire().formations].sort((a, b) => (a.date_debut ?? '9999').localeCompare(b.date_debut ?? '9999'))
}

export function trouverFormation(id: string): Formation | null {
  return lire().formations.find((f) => f.id === id) ?? null
}

export function creerFormation(d: {
  titre: string
  description: string | null
  lieu: string | null
  date_debut: string | null
  capacite: number | null
}): Resultat {
  if (!d.titre.trim()) return ko('Le titre est obligatoire.')
  if (d.capacite !== null && (!Number.isInteger(d.capacite) || d.capacite < 1)) return ko('Capacité invalide.')
  if (d.date_debut && Number.isNaN(Date.parse(d.date_debut))) return ko('Date invalide.')
  return modifier((db) => {
    db.formations.push({
      id: uid(),
      titre: d.titre.trim(),
      description: d.description?.trim() || null,
      lieu: d.lieu?.trim() || null,
      date_debut: d.date_debut ? new Date(d.date_debut).toISOString() : null,
      date_fin: null,
      capacite: d.capacite,
      ouvert_inscription: true,
      fichier_url: null,
      cree_le: maintenant(),
    })
    return ok(undefined)
  })
}

export function supprimerFormation(id: string): Resultat {
  return modifier((db) => {
    db.formations = db.formations.filter((f) => f.id !== id)
    db.inscriptions_formation = db.inscriptions_formation.filter((i) => i.formation_id !== id)
    return ok(undefined)
  })
}

export function etatInscription(formationId: string, membreId: string) {
  const db = lire()
  const f = db.formations.find((x) => x.id === formationId)
  const inscrits = db.inscriptions_formation.filter((i) => i.formation_id === formationId).length
  return {
    inscrit: db.inscriptions_formation.some((i) => i.formation_id === formationId && i.membre_id === membreId),
    nbInscrits: inscrits,
    complet: !!f?.capacite && inscrits >= f.capacite,
  }
}

/**
 * Corrige l'ancien bug : `membre_id` recevait l'identifiant du COMPTE
 * d'authentification et non celui du membre (clé étrangère invalide → les
 * inscriptions échouaient). Ici on utilise toujours l'id du membre.
 */
export function inscrireAFormation(formationId: string, membreId: string): Resultat {
  return modifier((db) => {
    const f = db.formations.find((x) => x.id === formationId)
    if (!f) return ko('Formation introuvable.')
    if (!f.ouvert_inscription) return ko('Les inscriptions sont closes.')
    if (db.inscriptions_formation.some((i) => i.formation_id === formationId && i.membre_id === membreId)) {
      return ko('Vous êtes déjà inscrit(e) à cette formation.')
    }
    if (f.capacite && db.inscriptions_formation.filter((i) => i.formation_id === formationId).length >= f.capacite) {
      return ko('Cette formation est complète.')
    }
    db.inscriptions_formation.push({ id: uid(), formation_id: formationId, membre_id: membreId, cree_le: maintenant() })
    pousserNotification(db, membreId, 'Inscription confirmée', `Vous êtes inscrit(e) à « ${f.titre} ».`, 'success')
    return ok(undefined)
  })
}

export function desinscrireDeFormation(formationId: string, membreId: string): Resultat {
  return modifier((db) => {
    db.inscriptions_formation = db.inscriptions_formation.filter((i) => !(i.formation_id === formationId && i.membre_id === membreId))
    return ok(undefined)
  })
}

export function inscritsDeFormation(formationId: string): Membre[] {
  const db = lire()
  const ids = new Set(db.inscriptions_formation.filter((i) => i.formation_id === formationId).map((i) => i.membre_id))
  return db.membres.filter((m) => ids.has(m.id)).map(versDTO)
}
