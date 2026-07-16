import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: membre } = await supabase
    .from('membres')
    .select('*')
    .eq('compte_id', user.id)
    .single()

  if (!membre) {
    redirect('/attente-validation')
  }

  // Récupérer les notifications du membre
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('membre_id', membre.id)
    .order('cree_le', { ascending: false })

  // Marquer comme lues
  if (notifications?.some(n => !n.lue)) {
    await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('membre_id', membre.id)
      .eq('lue', false)
  }

  const nonLues = notifications?.filter(n => !n.lue).length || 0

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Mon compte</span>
            <h1 className="font-serif text-3xl font-bold text-white mt-1">Notifications</h1>
          </div>
          {nonLues > 0 && (
            <span className="bg-anareka-or text-white text-xs font-semibold px-3 py-1 rounded-full">
              {nonLues} non lue{nonLues > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const typeColors: Record<string, string> = {
                success: 'bg-green-50 border-green-200 text-green-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                error: 'bg-red-50 border-red-200 text-red-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700',
              }

              const typeIcons: Record<string, string> = {
                success: '✅',
                warning: '⚠️',
                error: '❌',
                info: 'ℹ️',
              }

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-anareka border ${typeColors[notification.type] || typeColors.info} ${
                    !notification.lue ? 'border-l-4 border-l-anareka-or' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{typeIcons[notification.type] || typeIcons.info}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{notification.titre}</h3>
                      <p className="text-sm opacity-90">{notification.message}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(notification.cree_le).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-12 text-center text-anareka-gris">
            <p className="text-lg mb-2">Aucune notification</p>
            <p className="text-sm">Vous serez notifié des actualités de l'association</p>
          </div>
        )}
      </div>
    </main>
  )
}
