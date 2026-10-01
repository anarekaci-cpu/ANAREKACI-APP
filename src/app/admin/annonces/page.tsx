import { Badge, Carte, EnTeteAdmin, Flash, Vide, boutonCls, boutonPetitCls, champCls, dateFR, labelCls } from '@/components/ui'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { toutesLesAnnonces } from '@/services/contenu'
import { basculer, creer, supprimer } from './actions'

export default async function AdminAnnoncesPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  await exigerPermission('contenu')
  const annonces = toutesLesAnnonces()

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Gestion des annonces" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <Carte accent>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvelle annonce</h2>
          <form action={creer} className="space-y-4">
            <div>
              <label className={labelCls} htmlFor="titre">Titre</label>
              <input id="titre" name="titre" required maxLength={150} className={champCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="contenu">Contenu</label>
              <textarea id="contenu" name="contenu" rows={5} required className={champCls} />
            </div>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="publie" defaultChecked className="accent-anareka-vert" /> Publier maintenant (notifie les membres actifs)</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="epingle" className="accent-anareka-vert" /> Épingler</label>
            </div>
            <button className={boutonCls}>Créer l&apos;annonce</button>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Annonces existantes</h2>
          {annonces.length === 0 ? <Vide>Aucune annonce.</Vide> : (
            <ul className="space-y-3">
              {annonces.map((a) => (
                <li key={a.id} className="border border-anareka-bordure rounded-anareka p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{a.titre}</p>
                      <p className="text-xs text-anareka-gris mt-1">{dateFR(a.cree_le)}</p>
                    </div>
                    <div className="flex gap-2">
                      {a.epingle && <Badge ton="or">épinglé</Badge>}
                      <Badge ton={a.publie ? 'vert' : 'gris'}>{a.publie ? 'publié' : 'brouillon'}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {(['publie', 'epingle'] as const).map((champ) => (
                      <form key={champ} action={basculer}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="champ" value={champ} />
                        <button className={`${boutonPetitCls} bg-anareka-vert-pale text-anareka-vert hover:bg-anareka-vert hover:text-white`}>
                          {champ === 'publie' ? (a.publie ? 'Dépublier' : 'Publier') : a.epingle ? 'Désépingler' : 'Épingler'}
                        </button>
                      </form>
                    ))}
                    <form action={supprimer}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200`}>Supprimer</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </main>
  )
}
