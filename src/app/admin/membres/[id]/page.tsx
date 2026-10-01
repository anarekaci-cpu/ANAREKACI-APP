import { notFound } from 'next/navigation'
import ChampsPaiement from '@/components/FormulairePaiement'
import SelectionMois from '@/components/SelectionMois'
import { Badge, Carte, EnTeteAdmin, Flash, boutonPleinCls, dateFR } from '@/components/ui'
import { ROLE_LABELS, aPermission, formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { resumeCotisations } from '@/services/cotisations'
import { droitDuMembre } from '@/services/droits'
import { trouverMembre } from '@/services/membres'
import { encaisser } from '../actions'

export default async function AdminMembreDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  const { id } = await params
  const { erreur, succes } = await searchParams
  // Le trésorier doit pouvoir consulter la fiche (pour encaisser) sans pouvoir gérer les membres.
  const admin = await exigerPermission('rapports')
  const membre = trouverMembre(id)
  if (!membre) notFound()

  const annee = new Date().getFullYear()
  const droit = droitDuMembre(membre.id)
  const r = resumeCotisations(membre.id, annee)
  const peutEncaisser = aPermission(admin.role, 'paiements')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre={membre.nom_complet} retour={{ href: '/admin/membres', label: 'Liste des membres' }} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />

        <Carte accent>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['N° de membre', membre.numero_membre],
              ['Téléphone', membre.telephone],
              ['Commune / quartier', membre.commune_quartier ?? '—'],
              ["Type d'activité", membre.type_activite ?? '—'],
              ['Rôle', ROLE_LABELS[membre.role]],
              ['Inscrit le', dateFR(membre.cree_le)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-anareka-bordure py-1.5">
                <dt className="text-anareka-gris">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between border-b border-anareka-bordure py-1.5">
              <dt className="text-anareka-gris">Statut</dt>
              <dd><Badge ton={membre.statut === 'actif' ? 'vert' : membre.statut === 'suspendu' ? 'rouge' : 'or'}>{membre.statut}</Badge></dd>
            </div>
            <div className="flex justify-between border-b border-anareka-bordure py-1.5">
              <dt className="text-anareka-gris">Droit d&apos;inscription</dt>
              <dd><Badge ton={droit?.statut === 'paye' ? 'vert' : droit?.statut === 'refuse' ? 'rouge' : 'or'}>{droit?.statut.replaceAll('_', ' ') ?? '—'}</Badge></dd>
            </div>
          </dl>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-1">Cotisations {annee}</h2>
          <p className="text-xs text-anareka-gris mb-4">{r.nbPayes}/12 mois payés · {formatFCFA(r.totalPaye)} versés · reste {formatFCFA(r.resteAPayer)}</p>

          {peutEncaisser && r.grille.some((l) => l.statut === 'non_paye') ? (
            <form action={encaisser} className="space-y-4">
              <input type="hidden" name="membreId" value={membre.id} />
              <input type="hidden" name="annee" value={annee} />
              <SelectionMois grille={r.grille} moisCourant={new Date().getMonth() + 1} />
              <ChampsPaiement />
              <button className={boutonPleinCls}>Encaisser (validation immédiate)</button>
            </form>
          ) : (
            <p className="text-sm text-anareka-vert font-semibold">{r.grille.every((l) => l.statut !== 'non_paye') ? 'Tout est réglé pour cette année.' : ''}</p>
          )}
        </Carte>
      </div>
    </main>
  )
}
