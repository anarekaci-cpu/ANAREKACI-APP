'use client'

import { genererCarteMembre } from '@/lib/pdf'

export default function CarteMembrePdf(props: { nom: string; numeroMembre: string; depuis: string; role: string }) {
  return (
    <button
      type="button"
      onClick={() => genererCarteMembre(props).save(`carte_${props.numeroMembre}.pdf`)}
      className="btn btn-shine bg-anareka-or text-anareka-noir px-7 py-3.5 shadow-anareka-or hover:bg-anareka-or-clair"
    >
      Télécharger ma carte (PDF)
    </button>
  )
}
