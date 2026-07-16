import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
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

  // Récupérer les conversations du membre
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        membre_id,
        membres(id, nom_complet, role)
      ),
      messages(
        id,
        contenu,
        envoye_par,
        date_envoi,
        lu
      )
    `)
    .contains('participants', `[{"membre_id":"${membre.id}"}]`)
    .order('modifie_le', { ascending: false })

  // Récupérer les messages non lus
  const { data: messagesNonLus } = await supabase
    .from('messages')
    .select('*')
    .eq('lu', false)
    .neq('envoye_par', membre.id)

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Communication</span>
            <h1 className="font-serif text-3xl font-bold text-white mt-1">Messagerie</h1>
          </div>
          <Link 
            href="/messages/nouveau"
            className="bg-anareka-or text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-4 py-2 hover:bg-anareka-or-clair transition-colors"
          >
            Nouveau message
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Conversations</p>
            <p className="text-2xl font-bold text-anareka-vert">{conversations?.length || 0}</p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Non lus</p>
            <p className="text-2xl font-bold text-anareka-or">{messagesNonLus?.length || 0}</p>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          {conversations && conversations.length > 0 ? (
            <div className="divide-y divide-anareka-bordure">
              {conversations.map((conversation) => {
                const dernierMessage = conversation.messages?.[0]
                const autresParticipants = conversation.participants?.filter(
                  (p: any) => p.membre_id !== membre.id
                )
                const nomConversation = autresParticipants?.length === 1
                  ? autresParticipants[0].membres.nom_complet
                  : conversation.titre || 'Conversation de groupe'

                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className="block p-4 hover:bg-anareka-ivoire transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-anareka-noir">{nomConversation}</h3>
                          {conversation.messages?.some((m: any) => !m.lu && m.envoye_par !== membre.id) && (
                            <span className="w-2 h-2 rounded-full bg-anareka-or" />
                          )}
                        </div>
                        {dernierMessage && (
                          <p className="text-sm text-anareka-gris line-clamp-1">
                            {dernierMessage.contenu}
                          </p>
                        )}
                      </div>
                      {dernierMessage && (
                        <p className="text-xs text-anareka-gris whitespace-nowrap">
                          {new Date(dernierMessage.date_envoi).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-anareka-gris">
              <p className="mb-4">Aucune conversation</p>
              <Link 
                href="/messages/nouveau"
                className="text-anareka-vert font-semibold hover:text-anareka-or transition-colors"
              >
                Commencer une conversation
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
