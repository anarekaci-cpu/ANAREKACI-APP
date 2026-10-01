import Link from 'next/link'
import { redirect } from 'next/navigation'
import ChampsPaiement from '@/components/FormulairePaiement'
import { Flash, boutonPleinCls } from '@/components/ui'
import { TARIFS, formatFCFA } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { droitDuMembre } from '@/services/droits'
import { declarerPaiement } from '../actions'

export default async function PayerDroitInscriptionPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()
  const droit = droitDuMembre(membre.id)
  if (droit?.statut === 'paye' || droit?.statut === 'en_attente_validation') redirect('/droit-inscription')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <div className="max-w-md mx-auto px-4 py-12 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-5 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Déclarer mon paiement</h1>
            <p className="text-3xl font-bold text-anareka-vert">{formatFCFA(TARIFS.droitInscription)}</p>
            <p className="text-xs text-anareka-gris mt-1">Droit d&apos;inscription</p>
          </div>

          <Flash erreur={erreur} succes={succes} />

          <form action={declarerPaiement} className="space-y-4">
            <ChampsPaiement />
            <button type="submit" className={boutonPleinCls}>Envoyer ma déclaration</button>
          </form>

          <Link href="/droit-inscription" className="block mt-6 pt-6 border-t border-anareka-bordure text-center text-sm text-anareka-gris hover:text-anareka-vert transition-colors">
            ← Retour
          </Link>
        </div>

        <div className="mt-6 bg-anareka-vert-pale rounded-anareka p-4 border border-anareka-vert-clair/20 text-xs text-anareka-vert-clair space-y-2">
          <h3 className="font-semibold text-anareka-vert text-sm">Comment payer ?</h3>
          <p>Réglez au bureau ou par Mobile Money / virement, puis déclarez le paiement ici avec la référence reçue. Le bureau le validera.</p>
          <p className="text-anareka-gris">Les coordonnées de paiement vous sont communiquées par le bureau.</p>
        </div>
      </div>
    </main>
  )
}
