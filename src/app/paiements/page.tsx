import RecuButton from '@/components/RecuButton'
import { Badge, Carte, EnTete, Vide, dateFR } from '@/components/ui'
import { METHODE_LABELS, MOIS_NOMS, formatFCFA } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'
import { paiementsDuMembre } from '@/services/paiements'

const TON = { valide: 'vert', en_attente: 'or', refuse: 'rouge' } as const
const LIBELLE = { valide: 'Validé', en_attente: 'En attente', refuse: 'Refusé' } as const

export default async function PaiementsPage() {
  const membre = await exigerMembre()
  const paiements = paiementsDuMembre(membre.id)

  // Seuls les paiements VALIDÉS comptent dans les totaux (l'ancienne page comptait en plus les
  // cotisations ET les paiements : tout était compté deux fois, et le droit était figé à 5 000 F).
  const valides = paiements.filter((p) => p.statut === 'valide')
  const totalDroit = valides.filter((p) => p.type === 'droit_inscription').reduce((s, p) => s + p.montant, 0)
  const totalCotisations = valides.filter((p) => p.type === 'cotisation').reduce((s, p) => s + p.montant, 0)

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Mon compte" titre="Mes paiements" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['Total versé', totalDroit + totalCotisations],
            ["Droit d'inscription", totalDroit],
            ['Cotisations', totalCotisations],
          ].map(([titre, montant]) => (
            <div key={titre} className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
              <p className="text-xs text-anareka-gris mb-1">{titre}</p>
              <p className="text-2xl font-bold text-anareka-vert">{formatFCFA(Number(montant))}</p>
            </div>
          ))}
        </div>

        <Carte>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Historique</h2>
          {paiements.length === 0 ? (
            <Vide>Aucun paiement enregistré.</Vide>
          ) : (
            <ul className="divide-y divide-anareka-bordure">
              {paiements.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-anareka-noir text-sm">
                      {p.type === 'droit_inscription' ? "Droit d'inscription" : `Cotisation ${p.mois ? MOIS_NOMS[p.mois - 1] : ''} ${p.annee ?? ''}`}
                    </p>
                    <p className="text-xs text-anareka-gris">
                      {dateFR(p.date_paiement)} · {METHODE_LABELS[p.methode]}
                      {p.reference && ` · réf. ${p.reference}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-anareka-vert">{formatFCFA(p.montant)}</span>
                    <Badge ton={TON[p.statut]}>{LIBELLE[p.statut]}</Badge>
                    {p.statut === 'valide' && (
                      <RecuButton
                        type={p.type === 'cotisation' ? 'cotisation' : 'droit'}
                        nom={membre.nom_complet}
                        numeroMembre={membre.numero_membre}
                        montant={p.montant}
                        date={p.date_validation ?? p.date_paiement ?? p.cree_le}
                        mois={p.mois ?? undefined}
                        annee={p.annee ?? undefined}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </main>
  )
}
