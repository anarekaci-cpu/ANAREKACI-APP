import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function FormationsPage() {
  const supabase = await createClient()

  const { data: formations, error } = await supabase
    .from('formations')
    .select('id, titre, description, lieu, date_debut, date_fin, capacite')
    .order('date_debut', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-6 py-4">
        <h1 className="text-lg font-bold">Formations</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <p className="text-red-600 text-sm mb-4">
            Erreur de chargement : {error.message}
          </p>
        )}

        {formations && formations.length === 0 && (
          <p className="text-gray-500">Aucune formation pour le moment.</p>
        )}

        <div className="space-y-4">
          {formations?.map((f) => (
            <Link
              key={f.id}
              href={`/formations/${f.id}`}
              className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              <h2 className="font-semibold text-gray-800">{f.titre}</h2>
              {f.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {f.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {f.date_debut &&
                  new Date(f.date_debut).toLocaleDateString('fr-FR')}
                {f.lieu && ` · ${f.lieu}`}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}