import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

export default async function AdminEvenementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const { data: evenements } = await supabase
    .from('evenements')
    .select('*')
    .order('date_debut', { ascending: false })

  async function creerEvenement(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('evenements').insert({
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      lieu: formData.get('lieu') as string,
      date_debut: formData.get('date_debut') as string,
      date_fin: formData.get('date_fin') as string || null,
      type: formData.get('type') as string,
      cree_par: user.id,
    })

    revalidatePath('/admin/evenements')
  }

  async function supprimerEvenement(evenementId: string) {
    'use server'
    const supabase = await createClient()
    await supabase.from('evenements').delete().eq('id', evenementId)
    revalidatePath('/admin/evenements')
  }

  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
  const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
  const submitCls = "bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-vert-clair transition-colors"

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des événements</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvel événement</h2>
          <form action={creerEvenement} className="space-y-4">
            <div>
              <label className={labelCls}>Titre</label>
              <input name="titre" type="text" required className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea name="description" rows={3} className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Lieu</label>
              <input name="lieu" type="text" className={champCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date de début</label>
                <input name="date_debut" type="datetime-local" required className={champCls} />
              </div>
              <div>
                <label className={labelCls}>Date de fin (optionnel)</label>
                <input name="date_fin" type="datetime-local" className={champCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Type d&apos;événement</label>
              <select name="type" required className={champCls}>
                <option value="">Sélectionner</option>
                <option value="reunion">Réunion</option>
                <option value="assemblee">Assemblée générale</option>
                <option value="formation">Formation</option>
                <option value="evenement">Événement spécial</option>
              </select>
            </div>
            <button type="submit" className={submitCls}>Créer l&apos;événement</button>
          </form>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Événements existants</h2>
          <div className="space-y-3">
            {evenements?.length === 0 && (
              <p className="text-sm text-anareka-gris">Aucun événement pour le moment.</p>
            )}
            {evenements?.map((e) => (
              <div key={e.id} className="border border-anareka-bordure rounded-anareka p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-anareka-noir">{e.titre}</h3>
                      <span className="text-xs bg-anareka-vert-pale text-anareka-vert-clair px-2 py-0.5 rounded-full capitalize">
                        {e.type}
                      </span>
                    </div>
                    {e.description && (
                      <p className="text-sm text-anareka-gris mb-2">{e.description}</p>
                    )}
                    <div className="text-xs text-anareka-gris space-y-1">
                      {e.lieu && <p>📍 {e.lieu}</p>}
                      <p>
                        📅 {new Date(e.date_debut).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {e.date_fin && ` - ${new Date(e.date_fin).toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit'
                        })}`}
                      </p>
                    </div>
                  </div>
                  <form action={supprimerEvenement.bind(null, e.id)}>
                    <button className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-700">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
