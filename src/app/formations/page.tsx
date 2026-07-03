import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function FormationsPage() {
  const supabase = await createClient()

  const { data: formations, error } = await supabase
    .from('formations')
    .select('id, titre, description, lieu, date_debut, date_fin, capacite')
    .order('date_debut', { ascending: true })

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Association</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Formations</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        {error && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-anareka px-4 py-3 text-sm mb-4">
            Erreur de chargement : {error.message}
          </p>
        )}

        {formations && formations.length === 0 && (
          <p className="text-anareka-gris text-center py-12">Aucune formation pour le moment.</p>
        )}

        <div className="space-y-4">
          {formations?.map((f) => (
            <Link
              key={f.id}
              href={`/formations/${f.id}`}
              className="group block bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-l-4 border-l-anareka-vert shadow-anareka p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-anareka-hov hover:border-l-anareka-or"
            >
              <h2 className="font-serif text-xl font-semibold text-anareka-vert">{f.titre}</h2>
              {f.description && (
                <p className="text-sm text-anareka-gris mt-1 line-clamp-2">
                  {f.description}
                </p>
              )}
              <p className="text-xs text-anareka-gris mt-3 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-anareka-or" />
                {f.date_debut && new Date(f.date_debut).toLocaleDateString('fr-FR')}
                {f.lieu && ` · ${f.lieu}`}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}