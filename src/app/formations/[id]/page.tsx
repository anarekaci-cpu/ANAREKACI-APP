import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { sInscrire } from '../actions'

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formation } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .single()

  if (!formation) notFound()

  const { data: inscription } = await supabase
    .from('inscriptions_formation')
    .select('*')
    .eq('formation_id', id)
    .eq('membre_id', user.id)
    .maybeSingle()

  const { count: nbInscrits } = await supabase
    .from('inscriptions_formation')
    .select('*', { count: 'exact', head: true })
    .eq('formation_id', id)
    .eq('statut', 'inscrit')

  async function inscrireAction() {
    'use server'
    await sInscrire(id)
  }

  const infoCls = "text-sm text-anareka-noir/70 mb-1 flex items-center gap-1.5"
  const dotCls = "inline-block w-1.5 h-1.5 rounded-full bg-anareka-or"

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-up">
        <a href="/formations" className="text-xs font-semibold uppercase tracking-wide text-anareka-vert hover:text-anareka-or transition-colors">
          ← Retour aux formations
        </a>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8 mt-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Formation</span>
          <h2 className="font-serif text-2xl font-bold text-anareka-vert mt-1 mb-4">{formation.titre}</h2>

          <div className="space-y-1 mb-4">
            {formation.lieu && (
              <p className={infoCls}><span className={dotCls} /> Lieu : {formation.lieu}</p>
            )}
            {formation.date_debut && (
              <p className={infoCls}>
                <span className={dotCls} /> Date : {new Date(formation.date_debut).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
            {formation.capacite && (
              <p className={infoCls}>
                <span className={dotCls} /> Places : {nbInscrits ?? 0} / {formation.capacite}
              </p>
            )}
          </div>

          {formation.description && (
            <p className="text-anareka-noir/80 mt-4 whitespace-pre-line leading-relaxed border-t border-anareka-bordure pt-4">
              {formation.description}
            </p>
          )}

          <div className="mt-6">
            {inscription ? (
              <div className="bg-anareka-vert-pale text-anareka-vert-clair text-sm font-medium rounded-anareka px-4 py-3 border border-anareka-vert-clair/20">
                {inscription.statut === 'liste_attente'
                  ? "En liste d'attente"
                  : "Vous êtes inscrit(e) à cette formation"}
              </div>
            ) : formation.ouvert_inscription ? (
              <form action={inscrireAction}>
                <button
                  type="submit"
                  className="bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-vert-clair transition-colors shadow-anareka"
                >
                  S&apos;inscrire à cette formation
                </button>
              </form>
            ) : (
              <div className="bg-anareka-gris-clair text-anareka-gris text-sm rounded-anareka px-4 py-3">
                Les inscriptions sont fermées pour cette formation.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}