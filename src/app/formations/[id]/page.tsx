import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: formation } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .single()

  if (!formation) {
    redirect('/formations')
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Formations</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">{formation.titre}</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          {formation.description && (
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-2">Description</h2>
              <p className="text-sm text-anareka-noir/80">{formation.description}</p>
            </div>
          )}
          
          {formation.date && (
            <div className="mb-4">
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-2">Date</h2>
              <p className="text-sm text-anareka-noir/80">
                {new Date(formation.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {formation.lieu && (
            <div className="mb-4">
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-2">Lieu</h2>
              <p className="text-sm text-anareka-noir/80">{formation.lieu}</p>
            </div>
          )}

          {formation.fichier_url && (
            <div className="mt-6 pt-6 border-t border-anareka-bordure">
              <a
                href={formation.fichier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-anareka-or text-white font-semibold text-sm uppercase tracking-wide px-6 py-2.5 rounded-anareka hover:bg-anareka-or-clair transition-colors"
              >
                Télécharger le document
              </a>
            </div>
          )}
        </div>

        <a
          href="/formations"
          className="inline-block mt-6 text-sm font-semibold text-anareka-vert hover:text-anareka-or transition-colors"
        >
          ← Retour aux formations
        </a>
      </div>
    </main>
  )
}