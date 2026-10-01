import Link from 'next/link'
import { Badge, EnTeteAdmin, Flash, Vide, boutonPetitCls, champCls, dateFR } from '@/components/ui'
import { METHODE_LABELS, MOIS_NOMS, formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { listerPaiements } from '@/services/paiements'
import { refuserUnPaiement, validerSelection, validerUnPaiement } from './actions'

export default async function AdminPaiementsPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  await exigerPermission('paiements')

  const enAttente = listerPaiements({ statut: 'en_attente', type: 'cotisation' })
  const recents = listerPaiements({ statut: 'valide' }).slice(0, 10)

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Paiements de cotisations à valider" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />

        <section className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka">
          <div className="px-4 sm:px-6 py-4 border-b border-anareka-bordure">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert">{enAttente.length} en attente</h2>
            <p className="text-xs text-anareka-gris">Vérifiez la réception de l&apos;argent (Mobile Money, espèces…) avant de valider.</p>
          </div>

          {enAttente.length === 0 ? (
            <Vide>Aucun paiement en attente. 🎉</Vide>
          ) : (
            <>
              {/* Un seul formulaire pour « valider la sélection » ; les boutons individuels ont leurs propres formulaires hors du tableau. */}
              <form id="selection" action={validerSelection} />
              <ul className="divide-y divide-anareka-bordure">
                {enAttente.map((p) => (
                  <li key={p.id} className="p-4 flex flex-wrap items-center gap-4">
                    <input type="checkbox" form="selection" name="paiementId" value={p.id} className="accent-anareka-vert w-4 h-4" aria-label="Sélectionner" />
                    <div className="flex-1 min-w-48">
                      <Link href={`/admin/membres/${p.membre_id}`} className="font-semibold text-anareka-vert hover:text-anareka-or">
                        {p.membre?.nom_complet ?? 'Membre supprimé'}
                      </Link>
                      <p className="text-xs text-anareka-gris">
                        {p.mois ? `${MOIS_NOMS[p.mois - 1]} ${p.annee}` : ''} · {formatFCFA(p.montant)} · {METHODE_LABELS[p.methode]}
                        {p.reference && ` · réf. ${p.reference}`} · déclaré le {dateFR(p.date_paiement)}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <form action={validerUnPaiement}>
                        <input type="hidden" name="paiementId" value={p.id} />
                        <button className={`${boutonPetitCls} bg-anareka-vert text-white hover:bg-anareka-vert-clair`}>Valider</button>
                      </form>
                      <form action={refuserUnPaiement} className="flex gap-2">
                        <input type="hidden" name="paiementId" value={p.id} />
                        <input name="motif" placeholder="Motif" className={`${champCls} !py-1.5 !w-32`} />
                        <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200`}>Refuser</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 sm:px-6 py-4 border-t border-anareka-bordure">
                <button form="selection" className={`${boutonPetitCls} bg-anareka-vert text-white hover:bg-anareka-vert-clair !px-5 !py-2.5`}>
                  Valider les paiements cochés
                </button>
              </div>
            </>
          )}
        </section>

        <section className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">Derniers paiements validés</h2>
          {recents.length === 0 ? (
            <Vide>Aucun paiement validé.</Vide>
          ) : (
            <ul className="divide-y divide-anareka-bordure text-sm">
              {recents.map((p) => (
                <li key={p.id} className="flex justify-between gap-4 py-2.5">
                  <span>
                    {p.membre?.nom_complet} — {p.type === 'droit_inscription' ? "droit d'inscription" : `${p.mois ? MOIS_NOMS[p.mois - 1] : ''} ${p.annee ?? ''}`}
                  </span>
                  <span className="text-anareka-gris whitespace-nowrap">
                    {formatFCFA(p.montant)} <Badge ton="vert">validé</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
