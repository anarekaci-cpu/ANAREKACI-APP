import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Flash, boutonSecondaireCls } from '@/components/ui'
import { TARIFS, aAccesAdmin, formatFCFA } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { droitDuMembre } from '@/services/droits'
import { declarerPaiementEspeces } from './actions'

export default async function DroitInscriptionPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()
  if (aAccesAdmin(membre.role)) redirect('/admin')

  const droit = droitDuMembre(membre.id)
  if (droit?.statut === 'paye') redirect('/dashboard')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-5 sm:p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Bienvenue, {membre.nom} !</h1>
            <p className="text-anareka-gris text-sm">
              Votre numéro de membre : <span className="font-mono font-semibold text-anareka-vert">{membre.numero_membre}</span>
            </p>
          </div>

          <Flash erreur={erreur} succes={succes} />

          <div className="bg-anareka-vert-pale rounded-anareka p-4 mb-6 border border-anareka-vert-clair/20">
            <h2 className="font-semibold text-anareka-vert mb-2">Droit d&apos;inscription</h2>
            <p className="text-sm text-anareka-vert-clair mb-3">
              Pour accéder à toutes les fonctionnalités de l&apos;association, vous devez régler votre droit d&apos;inscription.
            </p>
            <p className="text-3xl font-bold text-anareka-vert">{formatFCFA(TARIFS.droitInscription)}</p>
          </div>

          {droit?.statut === 'en_attente_validation' ? (
            <div className="bg-anareka-or-pale rounded-anareka p-4 mb-6 border border-anareka-or/40">
              <h3 className="font-semibold text-anareka-terre mb-1">⏳ Demande en attente</h3>
              <p className="text-sm text-anareka-terre">
                Votre déclaration de paiement est en cours de validation par le bureau. Vous serez notifié dès qu&apos;elle sera traitée.
              </p>
              <Link href="/dashboard" className="inline-block mt-3 text-sm font-semibold text-anareka-vert hover:text-anareka-or">
                Aller au tableau de bord →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {droit?.statut === 'refuse' && (
                <div className="bg-red-50 rounded-anareka p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-1">❌ Demande refusée</h3>
                  <p className="text-sm text-red-700">{droit.motif_refus ?? "Votre paiement n'a pas pu être confirmé."}</p>
                  <p className="text-sm text-red-600 mt-1">Vous pouvez faire une nouvelle déclaration.</p>
                </div>
              )}
              <Link
                href="/droit-inscription/payer"
                className="block w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-3 text-center hover:bg-anareka-vert-clair transition-colors shadow-anareka"
              >
                Déclarer mon paiement ({formatFCFA(TARIFS.droitInscription)})
              </Link>
              <form action={declarerPaiementEspeces}>
                <button type="submit" className={`${boutonSecondaireCls} w-full py-3`}>
                  J&apos;ai déjà payé au bureau (espèces)
                </button>
              </form>
            </div>
          )}

          <p className="mt-6 pt-6 border-t border-anareka-bordure text-xs text-anareka-gris text-center">
            Besoin d&apos;aide ? Contactez le bureau de l&apos;association.
          </p>
        </div>
      </div>
    </main>
  )
}
