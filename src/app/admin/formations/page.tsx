import { Carte, EnTeteAdmin, Flash, Vide, boutonCls, boutonPetitCls, champCls, dateFR, labelCls } from '@/components/ui'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { inscritsDeFormation, listerFormations } from '@/services/contenu'
import { creer, supprimer } from './actions'

export default async function AdminFormationsPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  await exigerPermission('contenu')
  const formations = listerFormations()

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Gestion des formations" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <Carte accent>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvelle formation</h2>
          <form action={creer} className="space-y-4">
            <div><label className={labelCls} htmlFor="titre">Titre</label><input id="titre" name="titre" required className={champCls} /></div>
            <div><label className={labelCls} htmlFor="description">Description</label><textarea id="description" name="description" rows={3} className={champCls} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className={labelCls} htmlFor="lieu">Lieu</label><input id="lieu" name="lieu" className={champCls} /></div>
              <div><label className={labelCls} htmlFor="date_debut">Date de début</label><input id="date_debut" name="date_debut" type="datetime-local" className={champCls} /></div>
              <div><label className={labelCls} htmlFor="capacite">Capacité (optionnel)</label><input id="capacite" name="capacite" type="number" min="1" className={champCls} /></div>
            </div>
            <button className={boutonCls}>Créer la formation</button>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Formations existantes</h2>
          {formations.length === 0 ? <Vide>Aucune formation.</Vide> : (
            <ul className="space-y-3">
              {formations.map((f) => {
                const inscrits = inscritsDeFormation(f.id)
                return (
                  <li key={f.id} className="border border-anareka-bordure rounded-anareka p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{f.titre}</p>
                        <p className="text-xs text-anareka-gris mt-1">{f.date_debut ? dateFR(f.date_debut, true) : 'Date à définir'} · {f.lieu ?? 'Lieu non défini'}</p>
                        <p className="text-xs text-anareka-gris">{inscrits.length} inscrit{inscrits.length > 1 ? 's' : ''}{f.capacite ? ` / ${f.capacite}` : ''}</p>
                      </div>
                      <form action={supprimer}>
                        <input type="hidden" name="id" value={f.id} />
                        <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200 h-fit`}>Supprimer</button>
                      </form>
                    </div>
                    {inscrits.length > 0 && <p className="text-xs text-anareka-noir/70 mt-2">{inscrits.map((i) => i.nom_complet).join(', ')}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </Carte>
      </div>
    </main>
  )
}
