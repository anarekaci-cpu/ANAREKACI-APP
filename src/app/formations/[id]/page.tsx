import { notFound } from 'next/navigation'
import { Badge, Carte, EnTete, Flash, boutonCls, boutonSecondaireCls, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { etatInscription, trouverFormation } from '@/services/contenu'
import { seDesinscrire, sInscrire } from '../actions'

export default async function FormationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: FlashParams
}) {
  const { id } = await params
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()

  // Avant : redirection silencieuse vers la liste ; une vraie page 404 est plus claire.
  const formation = trouverFormation(id)
  if (!formation) notFound()

  const etat = etatInscription(formation.id, membre.id)
  const actif = membre.statut === 'actif'

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Formations" titre={formation.titre} retour={{ href: '/formations', label: 'Toutes les formations' }} />

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <Carte className="space-y-5">
          {formation.description && (
            <section>
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-1">Description</h2>
              <p className="text-sm text-anareka-noir/80 whitespace-pre-wrap">{formation.description}</p>
            </section>
          )}
          <section className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <h2 className="font-semibold text-anareka-vert mb-1">Date</h2>
              <p className="text-anareka-noir/80">{formation.date_debut ? dateFR(formation.date_debut, true) : 'À définir'}</p>
            </div>
            <div>
              <h2 className="font-semibold text-anareka-vert mb-1">Lieu</h2>
              <p className="text-anareka-noir/80">{formation.lieu ?? 'À définir'}</p>
            </div>
            <div>
              <h2 className="font-semibold text-anareka-vert mb-1">Places</h2>
              <p className="text-anareka-noir/80">
                {etat.nbInscrits} inscrit{etat.nbInscrits > 1 ? 's' : ''}
                {formation.capacite ? ` / ${formation.capacite}` : ''}
              </p>
            </div>
          </section>

          {formation.fichier_url && (
            <a
              href={formation.fichier_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-anareka-or text-white font-semibold text-sm px-6 py-2.5 rounded-anareka hover:bg-anareka-or-clair transition-colors"
            >
              Télécharger le document
            </a>
          )}

          <div className="pt-4 border-t border-anareka-bordure">
            {etat.inscrit ? (
              <form action={seDesinscrire} className="flex items-center gap-4">
                <input type="hidden" name="formationId" value={formation.id} />
                <Badge ton="vert">✓ Vous êtes inscrit(e)</Badge>
                <button className={boutonSecondaireCls}>Annuler mon inscription</button>
              </form>
            ) : !actif ? (
              <p className="text-sm text-anareka-terre">Votre adhésion doit être validée avant de pouvoir vous inscrire.</p>
            ) : !formation.ouvert_inscription ? (
              <Badge ton="gris">Inscriptions closes</Badge>
            ) : etat.complet ? (
              <Badge ton="rouge">Formation complète</Badge>
            ) : (
              <form action={sInscrire}>
                <input type="hidden" name="formationId" value={formation.id} />
                <button className={boutonCls}>Je m&apos;inscris</button>
              </form>
            )}
          </div>
        </Carte>
      </div>
    </main>
  )
}
