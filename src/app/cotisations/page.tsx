import Link from 'next/link'
import { redirect } from 'next/navigation'
import ChampsPaiement from '@/components/FormulairePaiement'
import Pagne from '@/components/Pagne'
import SelectionMois from '@/components/SelectionMois'
import { Carte, EnTete, Flash, boutonPleinCls, dateFR } from '@/components/ui'
import { MOIS_NOMS, TARIFS, aAccesAdmin, formatFCFA } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { anneesDisponibles, resumeCotisations } from '@/services/cotisations'
import { droitDuMembre } from '@/services/droits'
import { payerCotisations } from './actions'

export default async function CotisationsPage({ searchParams }: { searchParams: Promise<Awaited<FlashParams> & { annee?: string }> }) {
  const { erreur, succes, annee: anneeParam } = await searchParams
  const membre = await exigerMembre()

  // Les cotisations ne se paient qu'une fois le droit d'inscription validé.
  if (!aAccesAdmin(membre.role) && droitDuMembre(membre.id)?.statut !== 'paye') redirect('/droit-inscription')

  const annees = anneesDisponibles()
  const annee = annees.includes(Number(anneeParam)) ? Number(anneeParam) : annees[0]
  const r = resumeCotisations(membre.id, annee)
  const moisCourant = annee === new Date().getFullYear() ? new Date().getMonth() + 1 : null
  const aPayer = r.grille.some((l) => l.statut === 'non_paye')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete titre="Cotisations" retour={{ href: '/dashboard', label: 'Accueil' }} />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />

        <nav className="flex gap-2" aria-label="Année">
          {annees.map((a) => (
            <Link
              key={a}
              href={`/cotisations?annee=${a}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                a === annee ? 'bg-anareka-vert text-white border-anareka-vert' : 'bg-white text-anareka-vert border-anareka-bordure hover:border-anareka-or'
              }`}
            >
              {a}
            </Link>
          ))}
        </nav>

        <section className="rounded-[28px] border border-anareka-bordure bg-anareka-attieke p-5" aria-label="Mon pagne">
          <Pagne annee={annee} mois={r.grille.map((l) => l.statut)} />
        </section>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4">
            <div className="text-2xl font-bold text-anareka-vert">{r.nbPayes}/12</div>
            <div className="text-xs text-anareka-gris mt-1">mois payés</div>
          </div>
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4">
            <div className="text-xl font-bold whitespace-nowrap text-anareka-vert">{formatFCFA(r.totalPaye).replace(' FCFA', ' F')}</div>
            <div className="text-xs text-anareka-gris mt-1">total versé</div>
          </div>
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4">
            <div className="text-xl font-bold whitespace-nowrap text-anareka-terre">{formatFCFA(r.resteAPayer).replace(' FCFA', ' F')}</div>
            <div className="text-xs text-anareka-gris mt-1">reste à payer</div>
          </div>
        </div>

        <Carte accent>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-1">Régler mes cotisations {annee}</h2>
          <p className="text-xs text-anareka-gris mb-4">
            {formatFCFA(TARIFS.cotisationMensuelle)} par mois. Après votre déclaration, le trésorier valide le paiement.
          </p>
          {aPayer && membre.statut === 'actif' ? (
            <form action={payerCotisations} className="space-y-4">
              <input type="hidden" name="annee" value={annee} />
              <SelectionMois grille={r.grille} moisCourant={moisCourant} />
              <ChampsPaiement />
              <button type="submit" className={boutonPleinCls}>Déclarer mon paiement</button>
            </form>
          ) : !aPayer ? (
            <p className="text-sm text-anareka-vert font-semibold">Toutes les cotisations {annee} sont réglées ou en cours de validation.</p>
          ) : (
            <p className="text-sm text-anareka-terre">Votre adhésion doit être validée avant de pouvoir déclarer une cotisation.</p>
          )}
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-3">Détail {annee}</h2>
          <ul className="divide-y divide-anareka-bordure text-sm">
            {r.grille.map((l) => (
              <li key={l.mois} className="flex items-center justify-between py-2.5">
                <span>{MOIS_NOMS[l.mois - 1]}</span>
                <span className="text-anareka-gris text-xs">
                  {l.statut === 'paye' ? `Payé le ${dateFR(l.date_paiement)}` : l.statut === 'en_attente' ? 'En attente de validation' : 'Non payé'}
                </span>
              </li>
            ))}
          </ul>
        </Carte>
      </div>
    </main>
  )
}
