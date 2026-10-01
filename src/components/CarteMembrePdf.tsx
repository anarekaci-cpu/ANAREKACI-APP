'use client'

import { genererCarteMembre } from '@/lib/pdf'

export default function CarteMembrePdf(props: { nom: string; numeroMembre: string; depuis: string; role: string }) {
  return (
    <button
      type="button"
      onClick={() => genererCarteMembre(props).save(`carte_${props.numeroMembre}.pdf`)}
      className="btn-shine bg-anareka-or text-anareka-noir font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-or-clair transition-colors"
    >
      Télécharger ma carte (PDF)
    </button>
  )
}
