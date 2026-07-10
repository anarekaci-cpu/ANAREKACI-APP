import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { declarerPaiementExterne } from './actions'

export default async function DroitInscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: membre } = await supabase
    .from('membres')
    .select('*')
    .eq('compte_id', user.id)
    .single()

  if (!membre) {
    redirect('/attente-validation')
  }

  const { data: droit } = await supabase
    .from('droits_inscription')
    .select('*')
    .eq('membre_id', membre.id)
    .single()

  // Si le droit est déjà payé, rediriger vers le dashboard
  if (droit?.statut === 'paye') {
    redirect('/dashboard')
  }

  const MONTANT_DROIT = 10000 // FCFA

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">
              Bienvenue, {membre.nom} !
            </h1>
            <p className="text-anareka-gris text-sm">
              Votre numéro de membre : <span className="font-mono font-semibold text-anareka-vert">{membre.numero_membre}</span>
            </p>
          </div>

          <div className="bg-anareka-vert-pale rounded-anareka p-4 mb-6 border border-anareka-vert-clair/20">
            <h2 className="font-semibold text-anareka-vert mb-2">Droit d&apos;inscription</h2>
            <p className="text-sm text-anareka-vert-clair mb-3">
              Pour accéder à toutes les fonctionnalités de l&apos;association, vous devez régler votre droit d&apos;inscription.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-anareka-vert">{MONTANT_DROIT.toLocaleString('fr-FR')}</span>
              <span className="text-anareka-vert-clair">FCFA</span>
            </div>
          </div>

          {droit?.statut === 'en_attente_validation' ? (
            <div className="bg-anareka-or-pale rounded-anareka p-4 mb-6 border border-anareka-or/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏳</span>
                <h3 className="font-semibold text-anareka-terre">Demande en attente</h3>
              </div>
              <p className="text-sm text-anareka-terre">
                Votre déclaration de paiement est en cours de validation par l&apos;administrateur. Vous serez notifié dès qu&apos;elle sera traitée.
              </p>
            </div>
          ) : droit?.statut === 'refuse' ? (
            <div className="bg-red-50 rounded-anareka p-4 mb-6 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">❌</span>
                <h3 className="font-semibold text-red-700">Demande refusée</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">
                {droit.motif_refus || 'Votre paiement n&apos;a pas pu être confirmé.'}
              </p>
              <p className="text-sm text-red-600">
                Veuillez régler votre droit d&apos;inscription directement dans l&apos;application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/droit-inscription/payer"
                className="block w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-3 text-center hover:bg-anareka-vert-clair transition-colors shadow-anareka"
              >
                Payer maintenant ({MONTANT_DROIT.toLocaleString('fr-FR')} FCFA)
              </Link>

              <form action={declarerPaiementExterne}>
                <button
                  type="submit"
                  className="block w-full bg-anareka-blanc text-anareka-vert font-semibold text-sm uppercase tracking-wide rounded-anareka py-3 border-2 border-anareka-vert hover:bg-anareka-vert-pale transition-colors"
                >
                  J&apos;ai déjà payé à l&apos;association
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-anareka-bordure">
            <p className="text-xs text-anareka-gris text-center">
              Besoin d&apos;aide ? Contactez le bureau de l&apos;association.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
