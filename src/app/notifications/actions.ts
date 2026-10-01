'use server'

import { revalidatePath } from 'next/cache'
import { exigerMembre } from '@/lib/auth/dal'
import { marquerToutesLues } from '@/services/notifications'

export async function toutMarquerLu() {
  const membre = await exigerMembre()
  marquerToutesLues(membre.id)
  revalidatePath('/', 'layout') // met à jour le compteur dans la barre de navigation
}
