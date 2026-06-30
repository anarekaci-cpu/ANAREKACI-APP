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

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-6 py-4 flex items-center gap-4">
        <a href="/formations" className="text-sm hover:underline">Retour</a>
        <h1 className="text-lg font-bold">ANAREKA-CI</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{formation.titre}</h2>

          {formation.lieu && (
            <p className="text-sm text-gray-500 mb-1">Lieu : {formation.lieu}</p>
          )}
          {formation.date_debut && (
            <p className="text-sm text-gray-500 mb-1">
              Date : {new Date(formation.date_debut).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}
          {formation.capacite && (
            <p className="text-sm text-gray-500 mb-4">
              Places : {nbInscrits ?? 0} / {formation.capacite}
            </p>
          )}

          {formation.description && (
            <p className="text-gray-700 mt-4 whitespace-pre-line">{formation.description}</p>
          )}

          <div className="mt-6">
            {inscription ? (
              <div className="bg-green-50 text-green-700 text-sm font-medium rounded-lg px-4 py-3">
                {inscription.statut === 'liste_attente'
                  ? "En liste d'attente"
                  : "Vous etes inscrit(e) a cette formation"}
              </div>
            ) : formation.ouvert_inscription ? (
              <form action={inscrireAction}>
                <button
                  type="submit"
                  className="bg-green-700 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-green-800 transition"
                >
                  S inscrire a cette formation
                </button>
              </form>
            ) : (
              <div className="bg-gray-100 text-gray-500 text-sm rounded-lg px-4 py-3">
                Les inscriptions sont fermees pour cette formation.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
