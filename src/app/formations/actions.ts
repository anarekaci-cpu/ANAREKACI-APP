'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sInscrire(formationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Vous devez être connecté pour vous inscrire.' }
  }

  const { error } = await supabase
    .from('inscriptions_formation')
    .insert({
      formation_id: formationId,
      membre_id: user.id,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Vous êtes déjà inscrit(e) à cette formation.' }
    }
    return { error: "Échec de l'inscription. Réessayez." }
  }

  revalidatePath(`/formations/${formationId}`)
  return { success: true }
}