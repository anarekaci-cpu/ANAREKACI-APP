import { createClient } from '@/lib/supabase/server'

export default async function AnnoncesPage() {
  const supabase = await createClient()
  const { data: annonces, error } = await supabase
    .from('annonces')
    .select('id, titre, contenu, epingle, publie_le, cree_le')
    .eq('publie', true)
    .order('epingle', { ascending: false })
    .order('publie_le', { ascending: false, nullsFirst: false })

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-up">
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Association</span>
          <h1 className="font-serif text-3xl font-bold text-anareka-vert mt-1">Annonces</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-anareka px-4 py-3 mb-4">
            Erreur de chargement : {error.message}
          </div>
        )}

        {!error && (!annonces || annonces.length === 0) && (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-12 text-center text-anareka-gris">
            Aucune annonce pour le moment.
          </div>
        )}

        <div className="space-y-4">
          {annonces?.map((a) => (
            <article
              key={a.id}
              className={`bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6 transition-all duration-300 hover:shadow-anareka-hov ${a.epingle ? 'border-l-4 border-l-anareka-or' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-xl font-semibold text-anareka-vert">{a.titre}</h3>
                {a.epingle && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-anareka-or-pale text-anareka-terre border border-anareka-or/40 px-2.5 py-1 rounded-full font-semibold">
                    Épinglé
                  </span>
                )}
              </div>
              <p className="text-anareka-noir/80 mt-2 whitespace-pre-wrap leading-relaxed">{a.contenu}</p>
              {a.publie_le && (
                <p className="text-xs text-anareka-gris mt-4 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-anareka-or" />
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