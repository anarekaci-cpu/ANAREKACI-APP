import 'server-only'
import { randomBytes, randomUUID } from 'node:crypto'
import { hasherMotDePasse } from '@/lib/auth/password'
import type { Database } from './types'

/**
 * Données initiales créées au premier lancement.
 *
 * Administrateur :
 *  - téléphone : ADMIN_TELEPHONE (défaut 0100000000)
 *  - mot de passe : ADMIN_PASSWORD. En développement, défaut « Anareka@2026 ».
 *    En production SANS ADMIN_PASSWORD, un mot de passe aléatoire est généré
 *    et affiché une seule fois dans la console du serveur.
 */
export function creerBaseInitiale(): Database {
  const maintenant = new Date().toISOString()
  const telephone = (process.env.ADMIN_TELEPHONE ?? '0100000000').replace(/\s+/g, '')

  let motDePasse = process.env.ADMIN_PASSWORD
  if (!motDePasse) {
    if (process.env.NODE_ENV === 'production') {
      motDePasse = randomBytes(9).toString('base64url')
    } else {
      motDePasse = 'Anareka@2026'
    }
    console.info(
      `\n[ANAREKA] Compte administrateur créé — téléphone : ${telephone} | mot de passe : ${motDePasse}\n` +
        `[ANAREKA] Changez-le dès la première connexion (Profil).\n`
    )
  }

  const adminId = randomUUID()
  const annee = new Date().getFullYear().toString().slice(-2)

  return {
    membres: [
      {
        id: adminId,
        numero_membre: `AN${annee}0001`,
        telephone,
        mot_de_passe_hash: hasherMotDePasse(motDePasse),
        nom: 'Administrateur',
        prenoms: 'ANAREKA',
        nom_complet: 'Administrateur ANAREKA',
        email: null,
        sexe: null,
        commune_quartier: null,
        type_activite: null,
        statut: 'actif',
        role: 'admin',
        cree_le: maintenant,
      },
    ],
    droits_inscription: [],
    cotisations: [],
    paiements: [],
    evenements: [],
    notifications: [],
    formations: [],
    inscriptions_formation: [],
    conversations: [],
    conversation_participants: [],
    messages: [],
    annonces: [
      {
        id: randomUUID(),
        titre: 'Bienvenue sur la plateforme ANAREKA-CI',
        contenu:
          "Cette plateforme permet de gérer votre adhésion, vos cotisations mensuelles, les formations et les annonces de l'association.",
        epingle: true,
        publie: true,
        publie_le: maintenant,
        cree_le: maintenant,
        auteur_id: adminId,
      },
    ],
    visits_recensement: [],
  }
}
