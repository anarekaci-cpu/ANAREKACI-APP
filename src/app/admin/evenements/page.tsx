import { Badge, Carte, EnTeteAdmin, Flash, Vide, boutonCls, boutonPetitCls, champCls, dateFR, labelCls } from '@/components/ui'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { listerEvenements } from '@/services/contenu'
import { creer, supprimer } from './actions'

export default async function AdminEvenementsPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  await exigerPermission('contenu')
  const evenements = listerEvenements().reverse()

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Gestion des événements" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <Carte accent>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvel événement</h2>
          <form action={creer} className="space-y-4">
            <div><label className={labelCls} htmlFor="titre">Titre</label><input id="titre" name="titre" required className={champCls} /></div>
            <div><label className={labelCls} htmlFor="description">Description</label><textarea id="description" name="description" rows={3} className={champCls} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls} htmlFor="lieu">Lieu</label><input id="lieu" name="lieu" className={champCls} /></div>
              <div>
                <label className={labelCls} htmlFor="type">Type</label>
                <select id="type" name="type" className={champCls} defaultValue="evenement">
                  <option value="evenement">Événement</option><option value="reunion">Réunion</option>
                  <option value="assemblee">Assemblée</option><option value="formation">Formation</option>
                </select>
              </div>
              <div><label className={labelCls} htmlFor="date_debut">Début</label><input id="date_debut" name="date_debut" type="datetime-local" required className={champCls} /></div>
              <div><label className={labelCls} htmlFor="date_fin">Fin (optionnel)</label><input id="date_fin" name="date_fin" type="datetime-local" className={champCls} /></div>
            </div>
            <button className={boutonCls}>Créer l&apos;événement</button>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Événements</h2>
          {evenements.length === 0 ? <Vide>Aucun événement.</Vide> : (
            <ul className="space-y-3">
              {evenements.map((e) => (
                <li key={e.id} className="border border-anareka-bordure rounded-anareka p-4 flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{e.titre} <Badge ton="or">{e.type}</Badge></p>
                    <p className="text-xs text-anareka-gris mt-1">{dateFR(e.date_debut, true)}{e.lieu && ` · ${e.lieu}`}</p>
                  </div>
                  <form action={supprimer}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200 h-fit`}>Supprimer</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </main>
  )
}
