import { exigerAccesAdmin } from '@/lib/auth/dal'

/**
 * Garde d'entrée de l'espace admin. ATTENTION : un layout n'est pas ré-exécuté à chaque
 * navigation interne ; chaque page et chaque server action re-vérifie donc sa permission
 * précise (`exigerPermission`). Ce layout n'est qu'une première barrière.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigerAccesAdmin()
  return children
}
