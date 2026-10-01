import { aAccesAdmin } from '@/config/association'
import { membreCourant } from '@/lib/auth/dal'
import { compterNonLues } from '@/services/notifications'
import { compterMessagesNonLus } from '@/services/messagerie'
import NavbarMenu, { type LienNav } from './NavbarMenu'

/**
 * Navigation PENSÉE MOBILE : barre d'onglets en bas (pouce), feuille « Plus » pour le reste.
 * Sur grand écran, elle devient une barre horizontale classique.
 * Serveur : elle sait qui est connecté (liens selon le rôle, compteurs non lus).
 */
export default async function Navbar() {
  const membre = await membreCourant()
  if (!membre) return null

  const liens: LienNav[] = [
    { href: '/dashboard', label: 'Accueil', icone: '🏠', onglet: true },
    { href: '/cotisations', label: 'Cotisations', icone: '💰', onglet: true },
    { href: '/messages', label: 'Messages', icone: '✉️', onglet: true, compteur: compterMessagesNonLus(membre.id) },
    { href: '/notifications', label: 'Alertes', icone: '🔔', onglet: true, compteur: compterNonLues(membre.id) },
    { href: '/formations', label: 'Formations', icone: '📚' },
    { href: '/annonces', label: 'Annonces', icone: '📣' },
    { href: '/evenements', label: 'Événements', icone: '📅', pasSurBureau: true },
    { href: '/paiements', label: 'Mes paiements', icone: '🧾', pasSurBureau: true },
    { href: '/carte', label: 'Ma carte', icone: '🪪', pasSurBureau: true },
  ]
  if (aAccesAdmin(membre.role)) liens.push({ href: '/admin', label: 'Admin', icone: '⚙️' })

  return <NavbarMenu liens={liens} nom={membre.nom_complet} />
}

/** Réserve la place de la barre d'onglets fixe en bas de l'écran (mobile). */
export async function NavbarEspace() {
  const membre = await membreCourant()
  if (!membre) return null
  return <div className="h-24 xl:hidden" aria-hidden />
}
