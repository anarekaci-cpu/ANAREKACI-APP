import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecuButton from '@/components/RecuButton'

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default async function PaiementsPage() {
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

  // Récupérer tous les paiements du membre
  const { data: paiements } = await supabase
    .from('paiements')
    .select('*')
    .eq('membre_id', membre.id)
    .order('date_paiement', { ascending: false })

  // Récupérer les cotisations
  const { data: cotisations } = await supabase
    .from('cotisations')
    .select('*')
    .eq('membre_id', membre.id)
    .order('annee', { ascending: false })
    .order('mois', { ascending: false })

  // Récupérer le droit d'inscription
  const { data: droitInscription } = await supabase
    .from('droits_inscription')
    .select('*')
    .eq('membre_id', membre.id)
    .single()

  const totalPaiements = paiements?.reduce((sum, p) => sum + p.montant, 0) || 0
  const totalCotisations = cotisations?.reduce((sum, c) => sum + (c.statut === 'paye' ? c.montant : 0), 0) || 0
  const totalDroit = droitInscription?.statut === 'paye' ? 5000 : 0

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Mon compte</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Mes Paiements</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
        {/* Résumé financier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Total versé</p>
            <p className="text-3xl font-bold text-anareka-vert">{(totalPaiements + totalCotisations + totalDroit).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Droit d&apos;inscription</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalDroit.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Cotisations</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalCotisations.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          </div>
        </div>

        {/* Droit d'inscription */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6 mb-6">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Droit d&apos;inscription</h2>
          
          {droitInscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-anareka-noir">
                  <span className="font-semibold">Statut :</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    droitInscription.statut === 'paye' ? 'bg-anareka-vert-pale text-anareka-vert-clair' :
                    'bg-anareka-or-pale text-anareka-terre'
                  }`}>
                    {droitInscription.statut === 'paye' ? 'Payé' : 'En attente'}
                  </span>
                </p>
                {droitInscription.date_paiement && (
                  <p className="text-xs text-anareka-gris mt-1">
                    Payé le {new Date(droitInscription.date_paiement).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              {droitInscription.statut === 'paye' && (
                <RecuButton
                  type="droit"
                  data={{ ...droitInscription, nom_complet: membre.nom_complet, numero_membre: membre.numero_membre }}
                  label="Télécharger reçu"
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-anareka-gris">Aucun droit d&apos;inscription enregistré</p>
          )}
        </div>

        {/* Cotisations */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6 mb-6">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Cotisations</h2>
          
          {cotisations && cotisations.length > 0 ? (
            <div className="space-y-3">
              {cotisations.map((cotisation) => (
                <div key={cotisation.id} className="flex items-center justify-between py-3 border-b border-anareka-bordure last:border-0">
                  <div>
                    <p className="font-medium text-anareka-noir">
                      {MOIS_NOMS[cotisation.mois - 1]} {cotisation.annee}
                    </p>
                    <p className="text-xs text-anareka-gris">
                      {cotisation.statut === 'paye' && cotisation.date_paiement 
                        ? `Payé le ${new Date(cotisation.date_paiement).toLocaleDateString('fr-FR')}`
                        : 'Non payé'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      cotisation.statut === 'paye' ? 'text-anareka-vert' : 'text-anareka-gris'
                    }`}>
                      {cotisation.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                    {cotisation.statut === 'paye' && (
                      <RecuButton
                        type="cotisation"
                        data={{ ...cotisation, nom_complet: membre.nom_complet, numero_membre: membre.numero_membre }}
                        label="Reçu"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-anareka-gris">Aucune cotisation enregistrée</p>
          )}
        </div>

        {/* Autres paiements */}
        {paiements && paiements.length > 0 && (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Autres paiements</h2>
            
            <div className="space-y-3">
              {paiements.map((paiement) => (
                <div key={paiement.id} className="flex items-center justify-between py-3 border-b border-anareka-bordure last:border-0">
                  <div>
                    <p className="font-medium text-anareka-noir capitalize">{paiement.type}</p>
                    <p className="text-xs text-anareka-gris">
                      {paiement.date_paiement 
                        ? new Date(paiement.date_paiement).toLocaleDateString('fr-FR')
                        : 'En attente'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      paiement.statut === 'paye' ? 'text-anareka-vert' : 'text-anareka-gris'
                    }`}>
                      {paiement.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                    {paiement.statut === 'paye' && (
                      <RecuButton
                        type="autre"
                        data={{ ...paiement, nom_complet: membre.nom_complet, numero_membre: membre.numero_membre }}
                        label="Reçu"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
