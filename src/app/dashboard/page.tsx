import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">ANAREKA-CI</h1>
        <form action={logout}>
          <button className="text-sm bg-white text-green-700 font-medium px-4 py-1.5 rounded-lg">
            Déconnexion
          </button>
        </form>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-sm text-gray-500">Bienvenue,</p>
          <h2 className="text-2xl font-bold text-gray-800">{profile?.nom_complet}</h2>
          <p className="text-sm text-gray-400 mt-1">
            Identifiant : <span className="font-mono">{profile?.identifiant}</span>
          </p>
          <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
            {profile?.statut === 'actif' ? '✓ Membre actif' : '⏳ En attente de validation'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <a href="/cotisations" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
            <div className="text-2xl mb-2">💳</div>
            <div className="font-semibold text-gray-800 text-sm">Cotisations</div>
            <div className="text-xs text-gray-400 mt-1">Payer ou voir l'historique</div>
          </a>
          <a href="/annonces" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
            <div className="text-2xl mb-2">📢</div>
            <div className="font-semibold text-gray-800 text-sm">Annonces</div>
            <div className="text-xs text-gray-400 mt-1">Actualités de l'association</div>
          </a>
          <a href="/formations" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
            <div className="text-2xl mb-2">🎓</div>
            <div className="font-semibold text-gray-800 text-sm">Formations</div>
            <div className="text-xs text-gray-400 mt-1">S'inscrire et télécharger</div>
          </a>
        </div>
      </div>
    </main>
  )
}