import 'server-only'
import { lire, modifier, maintenant, uid } from '@/lib/db/store'
import type { Conversation, Membre, Message } from '@/lib/db/types'
import { versDTO } from '@/lib/auth/dal'
import { ko, ok, type Resultat } from './resultat'

export type ResumeConversation = {
  conversation: Conversation
  interlocuteurs: Membre[]
  dernierMessage: Message | null
  nonLus: number
}

/** Conversations du membre, la plus récente d'abord. */
export function conversationsDuMembre(membreId: string): ResumeConversation[] {
  const db = lire()
  const miennes = db.conversation_participants.filter((p) => p.membre_id === membreId).map((p) => p.conversation_id)
  return db.conversations
    .filter((c) => miennes.includes(c.id))
    .map((conversation) => {
      const ids = db.conversation_participants.filter((p) => p.conversation_id === conversation.id && p.membre_id !== membreId).map((p) => p.membre_id)
      const messages = db.messages.filter((m) => m.conversation_id === conversation.id).sort((a, b) => a.date_envoi.localeCompare(b.date_envoi))
      return {
        conversation,
        interlocuteurs: db.membres.filter((m) => ids.includes(m.id)).map(versDTO),
        dernierMessage: messages.at(-1) ?? null,
        nonLus: messages.filter((m) => !m.lu && m.envoye_par !== membreId).length,
      }
    })
    .sort((a, b) => b.conversation.modifie_le.localeCompare(a.conversation.modifie_le))
}

export function compterMessagesNonLus(membreId: string): number {
  return conversationsDuMembre(membreId).reduce((s, c) => s + c.nonLus, 0)
}

/** Retourne la conversation seulement si le membre en est participant (sinon null : contrôle d'accès). */
export function ouvrirConversation(conversationId: string, membreId: string) {
  const db = lire()
  const participe = db.conversation_participants.some((p) => p.conversation_id === conversationId && p.membre_id === membreId)
  const conversation = db.conversations.find((c) => c.id === conversationId)
  if (!participe || !conversation) return null
  const participants = db.conversation_participants.filter((p) => p.conversation_id === conversationId).map((p) => p.membre_id)
  return {
    conversation,
    participants: db.membres.filter((m) => participants.includes(m.id)).map(versDTO),
    messages: db.messages.filter((m) => m.conversation_id === conversationId).sort((a, b) => a.date_envoi.localeCompare(b.date_envoi)),
  }
}

export function marquerConversationLue(conversationId: string, membreId: string) {
  modifier((db) => {
    for (const m of db.messages) if (m.conversation_id === conversationId && m.envoye_par !== membreId) m.lu = true
  })
}

/** Démarre (ou retrouve) une conversation privée entre deux membres, avec un premier message optionnel. */
export function demarrerConversation(deId: string, versId: string, premierMessage: string): Resultat<string> {
  if (deId === versId) return ko('Vous ne pouvez pas vous écrire à vous-même.')
  const contenu = premierMessage.trim()
  return modifier((db) => {
    const destinataire = db.membres.find((m) => m.id === versId)
    if (!destinataire || destinataire.statut !== 'actif') return ko('Destinataire introuvable.')

    let conv = db.conversations.find((c) => {
      const ps = db.conversation_participants.filter((p) => p.conversation_id === c.id).map((p) => p.membre_id)
      return ps.length === 2 && ps.includes(deId) && ps.includes(versId)
    })
    const t = maintenant()
    if (!conv) {
      conv = { id: uid(), titre: null, cree_par: deId, cree_le: t, modifie_le: t }
      db.conversations.push(conv)
      db.conversation_participants.push(
        { id: uid(), conversation_id: conv.id, membre_id: deId, ajoute_le: t },
        { id: uid(), conversation_id: conv.id, membre_id: versId, ajoute_le: t }
      )
    }
    if (contenu) {
      db.messages.push({ id: uid(), conversation_id: conv.id, envoye_par: deId, contenu: contenu.slice(0, 2000), date_envoi: t, lu: false })
      conv.modifie_le = t
    }
    return ok(conv.id)
  })
}

export function envoyerMessage(conversationId: string, membreId: string, contenu: string): Resultat {
  const texte = contenu.trim()
  if (!texte) return ko('Message vide.')
  return modifier((db) => {
    const participe = db.conversation_participants.some((p) => p.conversation_id === conversationId && p.membre_id === membreId)
    const conv = db.conversations.find((c) => c.id === conversationId)
    if (!participe || !conv) return ko('Conversation introuvable.')
    const t = maintenant()
    db.messages.push({ id: uid(), conversation_id: conversationId, envoye_par: membreId, contenu: texte.slice(0, 2000), date_envoi: t, lu: false })
    conv.modifie_le = t
    return ok(undefined)
  })
}

/** Annuaire pour choisir un destinataire (membres actifs, sans soi-même, sans données sensibles). */
export function annuaire(exceptId: string): Pick<Membre, 'id' | 'nom_complet' | 'numero_membre'>[] {
  return lire()
    .membres.filter((m) => m.statut === 'actif' && m.id !== exceptId)
    .map((m) => ({ id: m.id, nom_complet: m.nom_complet, numero_membre: m.numero_membre }))
    .sort((a, b) => a.nom_complet.localeCompare(b.nom_complet))
}
