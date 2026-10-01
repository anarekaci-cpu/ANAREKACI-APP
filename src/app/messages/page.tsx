import Link from 'next/link'
import { Vide, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import { conversationsDuMembre } from '@/services/messagerie'

export default async function MessagesPage() {
  const membre = await exigerMembre()
  const conversations = conversationsDuMembre(membre.id)
  const nonLus = conversations.reduce((s, c) => s + c.nonLus, 0)

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold text-anareka-or">Communication</span>
            <h1 className="font-serif text-3xl font-bold text-white mt-1">Messagerie</h1>
          </div>
          <Link href="/messages/nouveau" className="bg-anareka-or text-white font-semibold text-sm rounded-anareka px-4 py-2 hover:bg-anareka-or-clair transition-colors">
            Nouveau message
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
            <p className="text-xs text-anareka-gris mb-1">Conversations</p>
            <p className="text-2xl font-bold text-anareka-vert">{conversations.length}</p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
            <p className="text-xs text-anareka-gris mb-1">Non lus</p>
            <p className="text-2xl font-bold text-anareka-terre">{nonLus}</p>
          </div>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          {conversations.length === 0 ? (
            <Vide>Aucune conversation. Écrivez à un membre avec « Nouveau message ».</Vide>
          ) : (
            <ul className="divide-y divide-anareka-bordure">
              {conversations.map((c) => (
                <li key={c.conversation.id}>
                  <Link href={`/messages/${c.conversation.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-anareka-vert-pale/40 transition-colors">
                    <div className="min-w-0">
                      <p className={`text-sm text-anareka-vert ${c.nonLus ? 'font-bold' : 'font-semibold'}`}>
                        {c.interlocuteurs.map((i) => i.nom_complet).join(', ') || 'Conversation'}
                      </p>
                      <p className="text-xs text-anareka-gris truncate mt-0.5">{c.dernierMessage?.contenu ?? 'Aucun message'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {c.dernierMessage && <p className="text-[11px] text-anareka-gris">{dateFR(c.dernierMessage.date_envoi)}</p>}
                      {c.nonLus > 0 && (
                        <span className="inline-flex mt-1 bg-anareka-or text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 items-center justify-center">{c.nonLus}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
