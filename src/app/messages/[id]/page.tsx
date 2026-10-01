import { notFound } from 'next/navigation'
import { Flash, boutonCls, champCls, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { marquerConversationLue, ouvrirConversation } from '@/services/messagerie'
import { repondre } from '../actions'
import Link from 'next/link'

export default async function ConversationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  const { id } = await params
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()

  // `ouvrirConversation` renvoie null si le membre n'est pas participant : on ne révèle même pas l'existence.
  const data = ouvrirConversation(id, membre.id)
  if (!data) notFound()
  marquerConversationLue(id, membre.id)

  const autres = data.participants.filter((p) => p.id !== membre.id).map((p) => p.nom_complet).join(', ')

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <Link href="/messages" className="text-xs text-anareka-or-clair hover:text-anareka-terre">← Messagerie</Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">{autres || 'Conversation'}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <div className="space-y-3 mb-6">
          {data.messages.map((m) => {
            const moi = m.envoye_par === membre.id
            return (
              <div key={m.id} className={`flex ${moi ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-anareka-lg px-4 py-3 text-sm ${moi ? 'bg-anareka-vert text-white' : 'bg-anareka-blanc border border-anareka-bordure'}`}>
                  <p className="whitespace-pre-wrap">{m.contenu}</p>
                  <p className={`text-[10px] mt-1 ${moi ? 'text-white/70' : 'text-anareka-gris'}`}>{dateFR(m.date_envoi, true)}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form action={repondre} className="flex gap-3 items-end">
          <input type="hidden" name="conversationId" value={id} />
          <textarea name="contenu" rows={2} required maxLength={2000} placeholder="Votre message…" className={champCls} />
          <button className={boutonCls}>Envoyer</button>
        </form>
      </div>
    </main>
  )
}
