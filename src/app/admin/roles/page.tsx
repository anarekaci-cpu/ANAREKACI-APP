import { Badge, EnTeteAdmin, Flash, boutonPetitCls, champCls } from '@/components/ui'
import { ROLES, ROLE_LABELS } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { listerMembres } from '@/services/membres'
import { changerRole } from '../membres/actions'

export default async function AdminRolesPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const admin = await exigerPermission('membres')
  const membres = listerMembres().filter((m) => m.statut === 'actif')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Gestion des rôles" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <div className="bg-anareka-vert-pale border border-anareka-vert-clair/20 rounded-anareka p-4 text-xs text-anareka-vert-clair space-y-1">
          <p><strong>Trésorier</strong> : valide les paiements, encaisse, consulte rapports. <strong>Secrétaire</strong> : annonces, formations, événements. <strong>Bureau</strong> : gestion des membres et tout le reste. Seul un administrateur nomme le bureau et les administrateurs.</p>
        </div>
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka">
          <ul className="divide-y divide-anareka-bordure">
            {membres.map((m) => (
              <li key={m.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{m.nom_complet}</p>
                  <p className="text-xs text-anareka-gris">{m.numero_membre} · {m.telephone}</p>
                </div>
                {m.id === admin.id ? (
                  <Badge ton="or">{ROLE_LABELS[m.role]} (vous)</Badge>
                ) : (
                  <form action={changerRole} className="flex gap-2 items-center">
                    <input type="hidden" name="membreId" value={m.id} />
                    <select name="role" defaultValue={m.role} className={`${champCls} !py-1.5 !w-40`} aria-label={`Rôle de ${m.nom_complet}`}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    <button className={`${boutonPetitCls} bg-anareka-vert text-white hover:bg-anareka-vert-clair`}>Appliquer</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
