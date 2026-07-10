import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { payerCotisation } from '../actions'

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default async function PayerCotisationPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string; error?: string }>
}) {
  const { mois, error } = await searchParams
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

  const moisNumero = mois ? parseInt(mois) : new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const montant = 1000 // FCFA

  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
  const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <div className="max-w-md mx-auto px-4 py-12 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Payer la cotisation</h1>
            <p className="text-anareka-gris">
              {MOIS_NOMS[moisNumero - 1]} {currentYear}
            </p>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-3xl font-bold text-anareka-vert">{montant.toLocaleString('fr-FR')}</span>
              <span className="text-anareka-gris">FCFA</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-anareka px-4 py-3 mb-4">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={payerCotisation} className="space-y-4">
            <input type="hidden" name="mois" value={moisNumero} />
            <input type="hidden" name="annee" value={currentYear} />
            <input type="hidden" name="montant" value={montant} />

            <div>
              <label className={labelCls}>Méthode de paiement</label>
              <select name="methode" required className={champCls}>
                <option value="">Sélectionner</option>
                <option value="mobile_money">Mobile Money (Orange/MTN)</option>
                <option value="especes">Espèces</option>
                <option value="virement">Virement bancaire</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Référence de transaction (optionnel)</label>
              <input 
                name="reference" 
                type="text" 
                placeholder="Numéro de transaction" 
                className={champCls} 
              />
              <p className="text-xs text-anareka-gris mt-1">
                Pour Mobile Money, entrez le numéro de transaction reçu par SMS
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-3 hover:bg-anareka-vert-clair transition-colors shadow-anareka"
            >
              Confirmer le paiement
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-anareka-bordure">
            <a 
              href="/cotisations" 
              className="block text-center text-sm text-anareka-gris hover:text-anareka-vert transition-colors"
            >
              ← Retour aux cotisations
            </a>
          </div>
        </div>

        <div className="mt-6 bg-anareka-vert-pale rounded-anareka p-4 border border-anareka-vert-clair/20">
          <h3 className="font-semibold text-anareka-vert mb-2 text-sm">Informations de paiement</h3>
          <div className="space-y-2 text-xs text-anareka-vert-clair">
            <p><strong>Mobile Money:</strong> 07 XX XX XX XX</p>
            <p><strong>Virement:</strong> Banque XXX - Compte XXXXXXXXXXX</p>
            <p className="mt-2">Pour tout paiement en espèces, contactez directement le bureau.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
