import { Badge, EnTeteAdmin, Flash, Vide, boutonPetitCls, champCls, dateFR } from '@/components/ui'
import { formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { listerDroits } from '@/services/droits'
import { listerPaiements } from '@/services/paiements'
import { refuser, valider } from './actions'

export default async function AdminDroitsPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  await exigerPermission('paiements')

  const droits = listerDroits().filter((d) => d.statut === 'en_attente_validation' || d.statut === 'refuse')
  const paiements = listerPaiements({ type: 'droit_inscription' })

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Validation des droits d'inscription" />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-x-auto">
          {droits.length === 0 ? (
            <Vide>Aucune demande en attente.</Vide>
          ) : (
            <ul className="divide-y divide-anareka-bordure">
              {droits.map((d) => {
                const paiement = paiements.find((p) => p.membre_id === d.membre_id && p.statut === 'en_attente')
                return (
                  <li key={d.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-anareka-noir">{d.membre?.nom_complet ?? 'Membre supprimé'}</p>
                      <p className="text-xs text-anareka-gris">
                        {d.membre?.numero_membre} · {d.membre?.telephone} · {formatFCFA(d.montant)}
                      </p>
                      {paiement && (
                        <p className="text-xs text-anareka-gris mt-1">
                          Déclaré le {dateFR(paiement.date_paiement)} par {paiement.methode.replace('_', ' ')}
                          {paiement.reference && ` — réf. ${paiement.reference}`}
                        </p>
                      )}
                      {d.statut === 'refuse' && d.motif_refus && <p className="text-xs text-red-700 mt-1">Motif : {d.motif_refus}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge ton={d.statut === 'refuse' ? 'rouge' : 'or'}>{d.statut === 'refuse' ? 'refusé' : 'en attente'}</Badge>
                      {d.statut === 'en_attente_validation' && (
                        <>
                          <form action={valider}>
                            <input type="hidden" name="droitId" value={d.id} />
                            <button className={`${boutonPetitCls} bg-anareka-vert text-white hover:bg-anareka-vert-clair`}>Valider</button>
                          </form>
                          <form action={refuser} className="flex gap-2">
                            <input type="hidden" name="droitId" value={d.id} />
                            <input name="motif" placeholder="Motif du refus" className={`${champCls} !py-1.5 !w-44`} />
                            <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200`}>Refuser</button>
                          </form>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
