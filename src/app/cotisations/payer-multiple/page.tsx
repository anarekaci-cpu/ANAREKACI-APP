import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { payerCotisationsMultiples } from '../actions'

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default async function PayerCotisationsMultiplesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
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

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Récupérer les cotisations non payées
  const { data: cotisations } = await supabase
    .from('cotisations')
    .select('*')
    .eq('membre_id', membre.id)
    .eq('annee', currentYear)
    .eq('statut', 'non_paye')
    .order('mois', { ascending: true })

  const montantParMois = 1000 // FCFA

  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
  const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <div className="max-w-lg mx-auto px-4 py-12 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Payer plusieurs cotisations</h1>
            <p className="text-anareka-gris text-sm">
              Sélectionnez les mois que vous souhaitez payer
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-anareka px-4 py-3 mb-4">
              {decodeURIComponent(error)}
            </div>
          )}

          {!cotisations || cotisations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-anareka-gris">Toutes les cotisations de {currentYear} sont payées.</p>
            </div>
          ) : (
            <form action={payerCotisationsMultiples} className="space-y-4">
              <input type="hidden" name="annee" value={currentYear} />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cotisations.map((cotisation) => (
                  <label key={cotisation.id} className="flex items-center gap-3 p-3 rounded-anareka border border-anareka-bordure hover:bg-anareka-ivoire cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="mois"
                      value={cotisation.mois}
                      className="rounded accent-anareka-vert w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-anareka-noir">{MOIS_NOMS[cotisation.mois - 1]}</p>
                      <p className="text-xs text-anareka-gris">{montantParMois.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </label>
                ))}
              </div>

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
              </div>

              <button 
                type="submit" 
                className="w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-3 hover:bg-anareka-vert-clair transition-colors shadow-anareka"
              >
                Confirmer le paiement
              </button>
            </form>
          )}

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
