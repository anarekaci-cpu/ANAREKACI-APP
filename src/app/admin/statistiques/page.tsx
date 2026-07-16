import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

export default async function AdminStatistiquesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const currentYear = new Date().getFullYear()

  // Statistiques membres
  const { count: totalMembres } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })

  const { count: membresActifs } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'actif')

  const { count: membresEnAttente } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'en_attente')

  const { count: membresSuspendus } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'suspendu')

  // Statistiques droits d'inscription
  const { count: droitsPayes } = await supabase
    .from('droits_inscription')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'paye')

  const { count: droitsEnAttente } = await supabase
    .from('droits_inscription')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'en_attente_validation')

  // Statistiques cotisations de l'année
  const { data: cotisations } = await supabase
    .from('cotisations')
    .select('montant, statut')
    .eq('annee', currentYear)

  const totalCotisations = cotisations?.reduce((sum, c) => sum + (c.statut === 'paye' ? c.montant : 0), 0) || 0
  const cotisationsPayees = cotisations?.filter(c => c.statut === 'paye').length || 0
  const cotisationsTotal = cotisations?.length || 0

  // Statistiques paiements
  const { data: paiements } = await supabase
    .from('paiements')
    .select('montant, statut, type')

  const totalPaiements = paiements?.reduce((sum, p) => sum + p.montant, 0) || 0
  const paiementsEnAttente = paiements?.filter(p => p.statut === 'en_attente').length || 0

  // Calculer le taux de paiement mensuel
  const tauxPaiement = cotisationsTotal > 0 ? Math.round((cotisationsPayees / cotisationsTotal) * 100) : 0

  const carteStatCls = "bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6"
  const titreStatCls = "text-xs font-semibold uppercase tracking-wide text-anareka-gris mb-2"
  const valeurStatCls = "text-3xl font-bold text-anareka-vert"

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Statistiques de l&apos;association</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Statistiques membres */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Membres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className={carteStatCls}>
              <p className={titreStatCls}>Total membres</p>
              <p className={valeurStatCls}>{totalMembres || 0}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Membres actifs</p>
              <p className="text-3xl font-bold text-anareka-vert">{membresActifs || 0}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>En attente</p>
              <p className="text-3xl font-bold text-anareka-or">{membresEnAttente || 0}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Suspendus</p>
              <p className="text-3xl font-bold text-red-600">{membresSuspendus || 0}</p>
            </div>
          </div>
        </div>

        {/* Statistiques droits d'inscription */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Droits d&apos;inscription</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={carteStatCls}>
              <p className={titreStatCls}>Droits payés</p>
              <p className="text-3xl font-bold text-anareka-vert">{droitsPayes || 0}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>En attente de validation</p>
              <p className="text-3xl font-bold text-anareka-or">{droitsEnAttente || 0}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Montant total collecté</p>
              <p className="text-3xl font-bold text-anareka-vert">{((droitsPayes || 0) * 5000).toLocaleString('fr-FR')} <span className="text-lg">F</span></p>
            </div>
          </div>
        </div>

        {/* Statistiques cotisations */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Cotisations {currentYear}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className={carteStatCls}>
              <p className={titreStatCls}>Total collecté</p>
              <p className="text-3xl font-bold text-anareka-vert">{totalCotisations.toLocaleString('fr-FR')} <span className="text-lg">F</span></p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Mois payés</p>
              <p className="text-3xl font-bold text-anareka-vert">{cotisationsPayees}</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Taux de paiement</p>
              <p className="text-3xl font-bold text-anareka-vert">{tauxPaiement}%</p>
            </div>
            <div className={carteStatCls}>
              <p className={titreStatCls}>Paiements en attente</p>
              <p className="text-3xl font-bold text-anareka-or">{paiementsEnAttente}</p>
            </div>
          </div>
        </div>

        {/* Résumé financier */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Résumé financier</h2>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className={titreStatCls}>Total des recettes</p>
                <p className="text-3xl font-bold text-anareka-vert">{totalPaiements.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
              </div>
              <div>
                <p className={titreStatCls}>Droits d&apos;inscription</p>
                <p className="text-2xl font-bold text-anareka-vert">{((droitsPayes || 0) * 5000).toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
              </div>
              <div>
                <p className={titreStatCls}>Cotisations {currentYear}</p>
                <p className="text-2xl font-bold text-anareka-vert">{totalCotisations.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes */}
        {(droitsEnAttente || 0) > 0 && (
          <div className="bg-anareka-or-pale border border-anareka-or/40 rounded-anareka p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-semibold text-anareka-terre">Actions requises</h3>
            </div>
            <p className="text-sm text-anareka-terre">
              {droitsEnAttente} demande(s) de droit d&apos;inscription en attente de validation.
            </p>
            <a 
              href="/admin/droits-inscription" 
              className="inline-block mt-2 text-sm font-semibold text-anareka-vert hover:text-anareka-or transition-colors underline"
            >
              Voir les demandes →
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
