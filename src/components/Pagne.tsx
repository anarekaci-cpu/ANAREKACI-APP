import { MOIS_NOMS } from '@/config/association'

export type EtatCarreau = 'paye' | 'en_attente' | 'non_paye'

/**
 * « Mon pagne » : chaque mois payé tisse un carreau de pagne, dans l'ordre, comme un fil qui passe.
 * Douze carreaux = l'année complète. Les mois en attente de validation clignotent doucement.
 */
export default function Pagne({ mois, annee }: { mois: EtatCarreau[]; annee: number }) {
  let rang = 0
  return (
    <ol className="grid grid-cols-4 gap-2.5" aria-label={`Cotisations ${annee}`}>
      {mois.map((etat, i) => {
        const r = etat === 'paye' ? rang++ : 0
        const nom = MOIS_NOMS[i].slice(0, 3)
        const cls = etat === 'paye' ? 'carreau--tisse' : etat === 'en_attente' ? 'carreau--attente' : 'carreau--vide'
        return (
          <li key={i} className={`carreau ${cls}`} style={{ ['--i' as string]: r }} title={`${MOIS_NOMS[i]} : ${etat === 'paye' ? 'payé' : etat === 'en_attente' ? 'en attente de validation' : 'à payer'}`}>
            <span>{nom}</span>
          </li>
        )
      })}
    </ol>
  )
}
