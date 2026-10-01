import { Badge, Carte, EnTete, Flash, boutonPleinCls, champCls, dateFR, labelCls } from '@/components/ui'
import { ROLE_LABELS } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { majMotDePasse, majProfil } from './actions'

export default async function ProfilPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Mon compte" titre="Mon profil" />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />

        <Carte accent>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Informations personnelles</h2>
          <form action={majProfil} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="nom">Nom</label>
                <input id="nom" name="nom" defaultValue={membre.nom} required className={champCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="prenoms">Prénom(s)</label>
                <input id="prenoms" name="prenoms" defaultValue={membre.prenoms} required className={champCls} />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="telephone">Téléphone</label>
              <input id="telephone" value={membre.telephone} readOnly className={`${champCls} bg-gray-100 cursor-not-allowed`} />
              <p className="text-xs text-anareka-gris mt-1">C&apos;est votre identifiant de connexion. Pour le changer, contactez le bureau.</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="email">E-mail (optionnel)</label>
              <input id="email" name="email" type="email" defaultValue={membre.email ?? ''} className={champCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="commune_quartier">Commune / Quartier</label>
              <input id="commune_quartier" name="commune_quartier" defaultValue={membre.commune_quartier ?? ''} className={champCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="type_activite">Type d&apos;activité</label>
              <input id="type_activite" name="type_activite" defaultValue={membre.type_activite ?? ''} className={champCls} />
            </div>
            <button type="submit" className={boutonPleinCls}>Mettre à jour mon profil</button>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Changer mon mot de passe</h2>
          <form action={majMotDePasse} className="space-y-4">
            <div>
              <label className={labelCls} htmlFor="actuel">Mot de passe actuel</label>
              <input id="actuel" name="actuel" type="password" required autoComplete="current-password" className={champCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="nouveau">Nouveau</label>
                <input id="nouveau" name="nouveau" type="password" required minLength={8} autoComplete="new-password" className={champCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="confirmation">Confirmation</label>
                <input id="confirmation" name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={champCls} />
              </div>
            </div>
            <button type="submit" className={boutonPleinCls}>Modifier le mot de passe</button>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-4">Informations du compte</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-anareka-bordure">
              <dt className="text-anareka-gris">Numéro de membre</dt>
              <dd className="font-mono font-semibold">{membre.numero_membre}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-anareka-bordure">
              <dt className="text-anareka-gris">Statut</dt>
              <dd>
                <Badge ton={membre.statut === 'actif' ? 'vert' : membre.statut === 'suspendu' ? 'rouge' : 'or'}>
                  {membre.statut === 'en_attente' ? 'En attente' : membre.statut}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-anareka-bordure">
              <dt className="text-anareka-gris">Rôle</dt>
              <dd className="font-semibold">{ROLE_LABELS[membre.role]}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-anareka-gris">Membre depuis</dt>
              <dd>{dateFR(membre.cree_le)}</dd>
            </div>
          </dl>
        </Carte>
      </div>
    </main>
  )
}
