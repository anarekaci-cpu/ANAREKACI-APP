import { Vide, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import { notificationsDuMembre } from '@/services/notifications'
import { toutMarquerLu } from './actions'

const COULEURS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
} as const
const ICONES = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' } as const

export default async function NotificationsPage() {
  const membre = await exigerMembre()
  const notifications = notificationsDuMembre(membre.id)
  const nonLues = notifications.filter((n) => !n.lue).length

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Mon compte</span>
            <h1 className="font-serif text-3xl font-bold text-white mt-1">Notifications</h1>
          </div>
          {nonLues > 0 && (
            <form action={toutMarquerLu}>
              <button className="bg-anareka-or text-white text-xs font-semibold uppercase tracking-wide px-3 py-2 rounded-anareka hover:bg-anareka-or-clair transition-colors">
                Tout marquer comme lu ({nonLues})
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        {notifications.length === 0 ? (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka">
            <Vide>Aucune notification pour le moment.</Vide>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 rounded-anareka border ${COULEURS[n.type]} ${!n.lue ? 'border-l-4 border-l-anareka-or' : ''}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ICONES[n.type]}</span>
                  <div className="flex-1">
                    <h2 className="font-semibold text-sm mb-1">{n.titre}</h2>
                    <p className="text-sm opacity-90">{n.message}</p>
                    <p className="text-xs mt-2 opacity-75">{dateFR(n.cree_le, true)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
