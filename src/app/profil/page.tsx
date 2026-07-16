import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { mettreAJourProfil } from './actions'

export default async function ProfilPage() {
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

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Mon compte</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Mon Profil</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-6 mb-6">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Informations personnelles</h2>
          
          <form action={mettreAJourProfil} className="space-y-4">
            <input type="hidden" name="membreId" value={membre.id} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5">Nom</label>
                <input 
                  name="nom" 
                  type="text" 
                  defaultValue={membre.nom}
                  required 
                  className="w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5">Prénom(s)</label>
                <input 
                  name="prenoms" 
                  type="text" 
                  defaultValue={membre.prenoms}
                  required 
                  className="w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5">Téléphone</label>
              <input 
                name="telephone" 
                type="tel" 
                defaultValue={membre.telephone}
                required 
                className="w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
              />
              <p className="text-xs text-anareka-gris mt-1">Ce numéro est votre identifiant de connexion</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5">Commune / Quartier</label>
              <input 
                name="commune_quartier" 
                type="text" 
                defaultValue={membre.commune_quartier}
                required 
                className="w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5">Type d&apos;activité</label>
              <input 
                name="type_activite" 
                type="text" 
                defaultValue={membre.type_activite}
                required 
                className="w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-2.5 hover:bg-anareka-vert-clair transition-colors shadow-anareka"
              >
                Mettre à jour mon profil
              </button>
            </div>
          </form>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Informations du compte</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-anareka-bordure">
              <span className="text-sm text-anareka-gris">Numéro de membre</span>
              <span className="font-mono text-sm font-semibold text-anareka-noir">{membre.numero_membre}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-anareka-bordure">
              <span className="text-sm text-anareka-gris">Statut</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                membre.statut === 'actif' ? 'bg-anareka-vert-pale text-anareka-vert-clair' :
                membre.statut === 'suspendu' ? 'bg-red-100 text-red-700' :
                'bg-anareka-or-pale text-anareka-terre'
              }`}>
                {membre.statut === 'actif' ? 'Actif' : membre.statut === 'suspendu' ? 'Suspendu' : 'En attente'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-anareka-bordure">
              <span className="text-sm text-anareka-gris">Rôle</span>
              <span className="text-sm font-semibold text-anareka-noir capitalize">{membre.role}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-anareka-gris">Membre depuis</span>
              <span className="text-sm text-anareka-noir">
                {new Date(membre.cree_le).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
