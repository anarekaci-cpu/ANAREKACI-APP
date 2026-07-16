import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membre } = await getMembreParCompte(supabase, user.id)
  if (!membre || !estAdmin(membre.role)) {
    redirect('/dashboard')
  }

  const carteCls = "bg-anareka-vert-med border border-anareka-vert-clair/30 rounded-anareka-lg p-6 hover:border-anareka-or hover:shadow-anareka-or transition-all duration-300"
  const titreCarteCls = "font-serif text-xl font-bold text-white mb-2"
  const descCarteCls = "text-xs text-anareka-or-clair/80 mt-1"

  return (
    <main className="min-h-screen bg-anareka-noir">
      <header className="border-b-2 border-anareka-or">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or-clair">Espace</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Administration ANAREKA-CI</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a href="/admin/membres" className={carteCls}>
            <div className={titreCarteCls}>Membres</div>
            <div className={descCarteCls}>Valider, suspendre, gérer les rôles</div>
          </a>
          <a href="/admin/droits-inscription" className={carteCls}>
            <div className={titreCarteCls}>Droits d&apos;inscription</div>
            <div className={descCarteCls}>Valider les paiements</div>
          </a>
          <a href="/admin/cotisations" className={carteCls}>
            <div className={titreCarteCls}>Cotisations</div>
            <div className={descCarteCls}>Gérer les paiements mensuels</div>
          </a>
          <a href="/admin/paiements-cotisations" className={carteCls}>
            <div className={titreCarteCls}>Paiements en attente</div>
            <div className={descCarteCls}>Valider les cotisations déclarées par les membres</div>
          </a>
          <a href="/admin/annonces" className={carteCls}>
            <div className={titreCarteCls}>Annonces</div>
            <div className={descCarteCls}>Créer et publier des annonces</div>
          </a>
          <a href="/admin/formations" className={carteCls}>
            <div className={titreCarteCls}>Formations</div>
            <div className={descCarteCls}>Créer de nouvelles formations</div>
          </a>
          <a href="/admin/evenements" className={carteCls}>
            <div className={titreCarteCls}>Événements</div>
            <div className={descCarteCls}>Gérer les événements</div>
          </a>
          <a href="/admin/roles" className={carteCls}>
            <div className={titreCarteCls}>Rôles</div>
            <div className={descCarteCls}>Gérer les rôles des membres</div>
          </a>
          <a href="/admin/rapports" className={carteCls}>
            <div className={titreCarteCls}>Rapports</div>
            <div className={descCarteCls}>Rapports financiers détaillés</div>
          </a>
          <a href="/admin/statistiques" className={carteCls}>
            <div className={titreCarteCls}>Statistiques</div>
            <div className={descCarteCls}>Vue d&apos;ensemble de l&apos;association</div>
          </a>
        </div>
      </div>
    </main>
  )
}