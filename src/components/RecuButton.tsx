'use client'

import { genererRecuCotisation, genererRecuDroitInscription } from '@/lib/pdf'

type Props = {
  type: 'cotisation' | 'droit'
  nom: string
  numeroMembre: string
  montant: number
  /** date de validation du paiement (ISO) */
  date: string
  mois?: number
  annee?: number
  label?: string
}

export default function RecuButton({ type, nom, numeroMembre, montant, date, mois, annee, label = 'Reçu' }: Props) {
  const telecharger = () => {
    const doc =
      type === 'cotisation' && mois && annee
        ? genererRecuCotisation({ nom, numeroMembre, mois, annee, montant, date })
        : genererRecuDroitInscription({ nom, numeroMembre, montant, date })
    doc.save(`recu_${type}_${numeroMembre}${mois ? `_${annee}-${mois}` : ''}.pdf`)
  }

  return (
    <button
      type="button"
      onClick={telecharger}
      className="text-xs font-semibold uppercase tracking-wide bg-anareka-or text-white px-3 py-1.5 rounded-anareka hover:bg-anareka-or-clair transition-colors"
    >
      {label}
    </button>
  )
}
