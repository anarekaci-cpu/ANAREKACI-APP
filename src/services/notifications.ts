import 'server-only'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Database, Notification } from '@/lib/db/types'

/** À appeler À L'INTÉRIEUR d'un `modifier()` pour que la notification soit écrite avec le reste. */
export function pousserNotification(
  db: Database,
  membreId: string,
  titre: string,
  message: string,
  type: Notification['type'] = 'info'
) {
  db.notifications.push({ id: uid(), membre_id: membreId, titre, message, type, lue: false, cree_le: maintenant() })
}

export function notificationsDuMembre(membreId: string): Notification[] {
  return lire()
    .notifications.filter((n) => n.membre_id === membreId)
    .sort((a, b) => b.cree_le.localeCompare(a.cree_le))
}

export function compterNonLues(membreId: string): number {
  return lire().notifications.filter((n) => n.membre_id === membreId && !n.lue).length
}

export function marquerToutesLues(membreId: string) {
  modifier((db) => {
    for (const n of db.notifications) if (n.membre_id === membreId) n.lue = true
  })
}
