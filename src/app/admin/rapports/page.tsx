import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

export default async function AdminRapportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const currentYear = new Date().getFullYear()

  // Statistiques financières annuelles
  const { data: cotisations } = await supabase
    .from('cotisations')
    .select('montant, statut, mois, annee')
    .eq('annee', currentYear)

  const { data: droits } = await supabase
    .from('droits_inscription')
    .select('montant, statut, date_paiement')

  const { data: paiements } = await supabase
    .from('paiements')
    .select('montant, statut, type, date_paiement')

  // Calculs financiers
  const totalCotisations = cotisations?.reduce((sum, c) => sum + (c.statut === 'paye' ? c.montant : 0), 0) || 0
  const totalDroits = droits?.reduce((sum, d) => sum + (d.statut === 'paye' ? d.montant : 0), 0) || 0
  const totalAutres = paiements?.reduce((sum, p) => sum + (p.statut === 'paye' ? p.montant : 0), 0) || 0
  const totalGeneral = totalCotisations + totalDroits + totalAutres

  // Cotisations par mois
  const cotisationsParMois = Array(12).fill(0)
  cotisations?.forEach(c => {
    if (c.statut === 'paye' && c.mois >= 1 && c.mois <= 12) {
      cotisationsParMois[c.mois - 1] += c.montant
    }
  })

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  // Statistiques membres
  const { count: totalMembres } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })

  const { count: membresActifs } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'actif')

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Rapports Financiers</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Résumé financier */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Résumé financier {currentYear}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Total général</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalGeneral.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Cotisations</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalCotisations.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Droits inscription</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalDroits.toLocaleString('fr-FR')} F</p>
            </div>
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Autres revenus</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalAutres.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>

        {/* Cotisations mensuelles */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Cotisations par mois - {currentYear}</h2>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {moisNoms.map((mois, index) => (
                <div key={index} className="text-center p-4 bg-anareka-ivoire rounded-anareka">
                  <p className="text-xs text-anareka-gris mb-1">{mois}</p>
                  <p className="text-lg font-bold text-anareka-vert">
                    {cotisationsParMois[index].toLocaleString('fr-FR')} F
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistiques membres */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Statistiques des membres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Total membres</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalMembres || 0}</p>
            </div>
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Membres actifs</p>
              <p className="text-3xl font-bold text-anareka-vert">{membresActifs || 0}</p>
            </div>
            <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
              <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Taux d&apos;activité</p>
              <p className="text-3xl font-bold text-anareka-vert">
                {totalMembres ? Math.round((membresActifs || 0) / totalMembres * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Répartition des revenus */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Répartition des revenus</h2>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-anareka-noir">Cotisations</span>
                  <span className="font-semibold text-anareka-vert">
                    {totalGeneral > 0 ? Math.round(totalCotisations / totalGeneral * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-anareka-ivoire rounded-full h-3">
                  <div
                    className="bg-anareka-vert h-3 rounded-full transition-all"
                    style={{ width: `${totalGeneral > 0 ? (totalCotisations / totalGeneral * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-anareka-noir">Droits d&apos;inscription</span>
                  <span className="font-semibold text-anareka-or">
                    {totalGeneral > 0 ? Math.round(totalDroits / totalGeneral * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-anareka-ivoire rounded-full h-3">
                  <div
                    className="bg-anareka-or h-3 rounded-full transition-all"
                    style={{ width: `${totalGeneral > 0 ? (totalDroits / totalGeneral * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-anareka-noir">Autres revenus</span>
                  <span className="font-semibold text-anareka-terre">
                    {totalGeneral > 0 ? Math.round(totalAutres / totalGeneral * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-anareka-ivoire rounded-full h-3">
                  <div
                    className="bg-anareka-terre h-3 rounded-full transition-all"
                    style={{ width: `${totalGeneral > 0 ? (totalAutres / totalGeneral * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
