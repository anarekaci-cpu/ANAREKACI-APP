import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

type MembreWithCotisations = {
  id: string
  nom_complet: string
  numero_membre: string | null
  telephone: string | null
  statut: string
  cotisations?: Array<{
    id: string
    annee: number
    mois: number
    statut: string
    montant: number
    date_paiement: string | null
  }>
}

export default async function AdminCotisationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const currentYear = new Date().getFullYear()

  // Récupérer tous les membres avec leurs cotisations
  const { data: membres } = await supabase
    .from('membres')
    .select(`
      id,
      nom_complet,
      numero_membre,
      telephone,
      statut,
      cotisations (
        id,
        annee,
        mois,
        statut,
        montant,
        date_paiement
      )
    `)
    .eq('statut', 'actif')
    .order('nom_complet', { ascending: true }) as { data: MembreWithCotisations[] | null }

  // Calculer les statistiques globales
  const totalMembres = membres?.length || 0
  let totalCotisations = 0
  let totalEnRetard = 0
  let totalPaye = 0

  membres?.forEach((membre: MembreWithCotisations) => {
    const cotisationsAnnee = membre.cotisations?.filter((c) => c.annee === currentYear) || []
    const cotisationsPayees = cotisationsAnnee.filter((c) => c.statut === 'paye').length
    const currentMonth = new Date().getMonth() + 1
    const cotisationsEnRetard = cotisationsAnnee.filter((c) => 
      c.statut === 'non_paye' && c.mois < currentMonth
    ).length

    totalCotisations += cotisationsPayees * 2000
    totalEnRetard += cotisationsEnRetard
    totalPaye += cotisationsPayees
  })

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des cotisations</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Membres actifs</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalMembres}</p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Total collecté ({currentYear})</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalCotisations.toLocaleString('fr-FR')} <span className="text-lg">F</span></p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Mois payés</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalPaye}</p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">En retard</p>
            <p className="text-3xl font-bold text-red-600">{totalEnRetard}</p>
          </div>
        </div>

        {/* Tableau des membres et leurs cotisations */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <div className="px-6 py-4 border-b border-anareka-bordure">
            <h2 className="font-serif text-xl font-semibold text-anareka-vert">Cotisations par membre - {currentYear}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-anareka-vert-pale text-anareka-vert text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Membre</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">N° Membre</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Téléphone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-center">Payés/12</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-center">En retard</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-right">Total versé</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anareka-bordure">
                {membres?.map((membre: MembreWithCotisations) => {
                  const cotisationsAnnee = membre.cotisations?.filter((c) => c.annee === currentYear) || []
                  const cotisationsPayees = cotisationsAnnee.filter((c) => c.statut === 'paye')
                  const currentMonth = new Date().getMonth() + 1
                  const cotisationsEnRetard = cotisationsAnnee.filter((c) => 
                    c.statut === 'non_paye' && c.mois < currentMonth
                  )
                  const totalVerse = cotisationsPayees.reduce((sum: number, c) => sum + c.montant, 0)

                  return (
                    <tr key={membre.id} className="hover:bg-anareka-ivoire transition-colors">
                      <td className="px-4 py-3 font-medium text-anareka-noir">
                        {membre.nom_complet}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-anareka-noir/70">
                        {membre.numero_membre}
                      </td>
                      <td className="px-4 py-3 text-anareka-noir/80">
                        {membre.telephone || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          cotisationsPayees.length === 12 ? 'bg-anareka-vert-pale text-anareka-vert-clair' :
                          cotisationsPayees.length >= 6 ? 'bg-anareka-or-pale text-anareka-terre' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {cotisationsPayees.length}/12
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cotisationsEnRetard.length > 0 ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {cotisationsEnRetard.length}
                          </span>
                        ) : (
                          <span className="text-anareka-gris">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-anareka-noir">
                        {totalVerse.toLocaleString('fr-FR')} F
                      </td>
                      <td className="px-4 py-3">
                        <a 
                          href={`/admin/membres/${membre.id}/cotisations`}
                          className="text-xs font-semibold uppercase tracking-wide text-anareka-vert hover:text-anareka-or transition-colors"
                        >
                          Détails
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
