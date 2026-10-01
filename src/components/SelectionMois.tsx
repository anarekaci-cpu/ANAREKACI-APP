'use client'

import { useState } from 'react'
import { MOIS_NOMS, formatFCFA } from '@/config/association'

export type MoisSelectionnable = { mois: number; statut: 'paye' | 'en_attente' | 'non_paye'; montant: number }

/** Grille des 12 mois avec cases à cocher et total en direct. Le montant réel est recalculé côté serveur. */
export default function SelectionMois({ grille, moisCourant }: { grille: MoisSelectionnable[]; moisCourant: number | null }) {
  const [choisis, setChoisis] = useState<number[]>([])
  const total = grille.filter((l) => choisis.includes(l.mois)).reduce((s, l) => s + l.montant, 0)

  const basculer = (mois: number) => setChoisis((c) => (c.includes(mois) ? c.filter((m) => m !== mois) : [...c, mois]))

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {grille.map((l, idx) => {
          const libre = l.statut === 'non_paye'
          return (
            <label
              key={l.mois}
              style={{ ['--i' as string]: idx }}
              className={`reveal flex items-center gap-2 rounded-anareka border px-3 py-2.5 text-sm transition-colors ${
                l.statut === 'paye'
                  ? 'bg-anareka-vert-pale border-anareka-vert-clair/30 text-anareka-vert'
                  : l.statut === 'en_attente'
                    ? 'bg-anareka-or-pale border-anareka-or/40 text-anareka-terre'
                    : choisis.includes(l.mois)
                      ? 'bg-white border-anareka-or ring-2 ring-anareka-or/20 cursor-pointer'
                      : 'bg-white border-anareka-bordure hover:border-anareka-or cursor-pointer'
              } ${moisCourant === l.mois && libre ? 'font-semibold' : ''}`}
            >
              {libre ? (
                <input
                  type="checkbox"
                  name="mois"
                  value={l.mois}
                  checked={choisis.includes(l.mois)}
                  onChange={() => basculer(l.mois)}
                  className="accent-anareka-vert w-4 h-4"
                />
              ) : (
                <span aria-hidden>{l.statut === 'paye' ? '✓' : '⏳'}</span>
              )}
              <span className="flex-1">{MOIS_NOMS[l.mois - 1]}</span>
              <span className="sr-only">{l.statut === 'paye' ? 'payé' : l.statut === 'en_attente' ? 'en attente de validation' : 'non payé'}</span>
            </label>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-anareka-gris">
        {choisis.length === 0 ? 'Cochez les mois à régler.' : (
          <>
            {choisis.length} mois sélectionné{choisis.length > 1 ? 's' : ''} : <strong className="text-anareka-vert">{formatFCFA(total)}</strong>
          </>
        )}
      </p>
    </div>
  )
}
