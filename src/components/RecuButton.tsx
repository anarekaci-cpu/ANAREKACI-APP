'use client'

import { genererRecuCotisation, genererRecuDroitInscription } from '@/lib/pdf'

interface RecuButtonProps {
  type: 'cotisation' | 'droit' | 'autre'
  data: any
  label?: string
}

export default function RecuButton({ type, data, label = 'Télécharger reçu' }: RecuButtonProps) {
  const handleDownload = () => {
    let doc
    
    if (type === 'cotisation') {
      doc = genererRecuCotisation({
        nom: data.nom_complet,
        numeroMembre: data.numero_membre,
        mois: data.mois,
        annee: data.annee,
        montant: data.montant,
        date: data.date_paiement,
      })
    } else if (type === 'droit') {
      doc = genererRecuDroitInscription({
        nom: data.nom_complet,
        numeroMembre: data.numero_membre,
        montant: data.montant,
        date: data.date_paiement,
      })
    } else {
      return
    }

    doc.save(`recu_${type}_${data.numero_membre}_${Date.now()}.pdf`)
  }

  return (
    <button
      onClick={handleDownload}
      className="text-xs font-semibold uppercase tracking-wide bg-anareka-or text-white px-3 py-1.5 rounded-anareka hover:bg-anareka-or-clair transition-colors"
    >
      {label}
    </button>
  )
}
