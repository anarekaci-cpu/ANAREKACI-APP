import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AnnoncesPage() {
  const supabase = await createClient()

  const { data: annonces, error } = await supabase
    .from('annonces')
    .select('id, titre, contenu, epingle, publie_le, cree_le')
    .order('epingle', { ascending: false })
    .order('publie_le', { ascending: false, nullsFirst: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold">ANAREKA-CI</h1>
          <Link href="/dashboard" className="text-sm bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
            Retour
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Annonces</h2>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            Erreur de chargement : {error.message}
          </div>
        )}

        {!error && (!annonces || annonces.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">
            Aucune annonce pour le moment.
          </div>
        )}

        <div className="space-y-4">
          {annonces?.map((a) => (
            <article key={a.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-800">{a.titre}</h3>
                {a.epingle && (
                  <span className="shrink-0 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    Epingle
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{a.contenu}</p>
              {a.publie_le && (
                <p className="text-xs text-gray-400 mt-4">
                  {new Date(a.publie_le).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
