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
    { href: '/dashboard', label: 'Accueil', icone: 'accueil', onglet: true },
    { href: '/cotisations', label: 'Cotisations', icone: 'cotisations', onglet: true },
    { href: '/messages', label: 'Messages', icone: 'messages', onglet: true, compteur: compterMessagesNonLus(membre.id) },
    { href: '/formations', label: 'Formations', icone: 'formations', onglet: true },
    { href: '/notifications', label: 'Alertes', icone: 'alertes', compteur: compterNonLues(membre.id) },
    { href: '/annonces', label: 'Annonces', icone: 'annonces' },
    { href: '/evenements', label: 'Événements', icone: 'evenements', pasSurBureau: true },
    { href: '/paiements', label: 'Mes paiements', icone: 'paiements', pasSurBureau: true },
    { href: '/carte', label: 'Ma carte', icone: 'carte', pasSurBureau: true },
  ]
  if (aAccesAdmin(membre.role)) liens.push({ href: '/admin', label: 'Admin', icone: 'admin' })

  return <NavbarMenu liens={liens} nom={membre.nom_complet} />
}

/** Réserve la place de la barre d'onglets fixe en bas de l'écran (mobile). */
export async function NavbarEspace() {
  const membre = await membreCourant()
  if (!membre) return null
  return <div className="h-28 xl:hidden" aria-hidden />
}
