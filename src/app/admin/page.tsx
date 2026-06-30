import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'tresorier')) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Administration ANAREKA-CI</h1>
        <a href="/dashboard" className="text-sm hover:underline">Retour au site</a>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a href="/admin/membres" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <div className="text-2xl mb-2">Membres</div>
            <div className="text-xs text-gray-400 mt-1">Valider, suspendre, gerer les roles</div>
          </a>
          <a href="/admin/annonces" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <div className="text-2xl mb-2">Annonces</div>
            <div className="text-xs text-gray-400 mt-1">Creer et publier des annonces</div>
          </a>
          <a href="/admin/formations" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <div className="text-2xl mb-2">Formations</div>
            <div className="text-xs text-gray-400 mt-1">Creer de nouvelles formations</div>
          </a>
        </div>
      </div>
    </main>
  )
}
