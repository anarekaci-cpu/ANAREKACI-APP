import { Carte, EnTete, Flash, boutonPleinCls, champCls, labelCls } from '@/components/ui'
import { exigerMembreActif } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { annuaire } from '@/services/messagerie'
import { nouveauMessage } from '../actions'

export default async function NouveauMessagePage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const membre = await exigerMembreActif()
  const membres = annuaire(membre.id)

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Communication" titre="Nouveau message" retour={{ href: '/messages', label: 'Messagerie' }} />
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <Carte accent>
          {membres.length === 0 ? (
            <p className="text-sm text-anareka-gris">Aucun autre membre actif pour le moment.</p>
          ) : (
            <form action={nouveauMessage} className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="destinataire">Destinataire</label>
                <select id="destinataire" name="destinataire" required className={champCls} defaultValue="">
                  <option value="" disabled>Choisir un membre</option>
                  {membres.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom_complet} ({m.numero_membre})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="contenu">Message</label>
                <textarea id="contenu" name="contenu" rows={5} required maxLength={2000} className={champCls} />
              </div>
              <button className={boutonPleinCls}>Envoyer</button>
            </form>
          )}
        </Carte>
      </div>
    </main>
  )
}
