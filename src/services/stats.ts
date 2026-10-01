import 'server-only'
import { lire } from '@/lib/db/store'

export function statistiquesGlobales(annee = new Date().getFullYear()) {
  const db = lire()
  const valides = db.paiements.filter((p) => p.statut === 'valide')
  const somme = (liste: typeof valides) => liste.reduce((s, p) => s + p.montant, 0)

  const parMois = Array.from({ length: 12 }, (_, i) => {
    const mois = i + 1
    return {
      mois,
      total: somme(valides.filter((p) => p.date_validation && new Date(p.date_validation).getFullYear() === annee && new Date(p.date_validation).getMonth() + 1 === mois)),
    }
  })

  const membresActifs = db.membres.filter((m) => m.statut === 'actif')
  const cotisationsPayees = db.cotisations.filter((c) => c.annee === annee && c.statut === 'paye')

  return {
    membres: {
      total: db.membres.length,
      actifs: membresActifs.length,
      enAttente: db.membres.filter((m) => m.statut === 'en_attente').length,
      suspendus: db.membres.filter((m) => m.statut === 'suspendu').length,
      hommes: db.membres.filter((m) => m.sexe === 'homme').length,
      femmes: db.membres.filter((m) => m.sexe === 'femme').length,
    },
    aTraiter: {
      droits: db.droits_inscription.filter((d) => d.statut === 'en_attente_validation').length,
      paiements: db.paiements.filter((p) => p.statut === 'en_attente' && p.type === 'cotisation').length,
    },
    encaisse: {
      total: somme(valides),
      droits: somme(valides.filter((p) => p.type === 'droit_inscription')),
      cotisations: somme(valides.filter((p) => p.type === 'cotisation')),
    },
    cotisations: {
      annee,
      payees: cotisationsPayees.length,
      /** Taux = mois payés / (membres actifs × 12) */
      tauxRecouvrement: membresActifs.length ? Math.round((cotisationsPayees.length / (membresActifs.length * 12)) * 100) : 0,
    },
    parMois,
    communes: Object.entries(
      db.membres.reduce<Record<string, number>>((acc, m) => {
        const c = m.commune_quartier?.trim() || 'Non renseigné'
        acc[c] = (acc[c] ?? 0) + 1
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1]),
  }
}
