'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { exigerMembreActif } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { demarrerConversation, envoyerMessage } from '@/services/messagerie'

export async function nouveauMessage(formData: FormData) {
  const membre = await exigerMembreActif()
  const r = demarrerConversation(membre.id, String(formData.get('destinataire') ?? ''), String(formData.get('contenu') ?? ''))
  if (!r.ok) aller('/messages/nouveau', { erreur: r.erreur })
  revalidatePath('/messages')
  redirect(`/messages/${r.data}`)
}

export async function repondre(formData: FormData) {
  const membre = await exigerMembreActif()
  const id = String(formData.get('conversationId') ?? '')
  const r = envoyerMessage(id, membre.id, String(formData.get('contenu') ?? ''))
  if (!r.ok) aller(`/messages/${id}`, { erreur: r.erreur })
  revalidatePath(`/messages/${id}`)
  redirect(`/messages/${id}`)
}
