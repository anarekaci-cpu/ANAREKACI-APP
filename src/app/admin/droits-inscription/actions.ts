'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membre } = await getMembreParCompte(supabase, user.id)
  if (!membre || !estAdmin(membre.role)) return null

  return { supabase, adminId: membre.id }
}

export async function validerDroitInscription(droitId: string, membreId: string) {
  const result = await checkAdmin()
  if (!result) return { error: "Non autorisé" }
  
  const { supabase, adminId } = result

  // Mettre à jour le droit d'inscription
  const { error: droitError } = await supabase
    .from('droits_inscription')
    .update({
      statut: 'paye',
      date_validation: new Date().toISOString(),
      valide_par: adminId,
      motif_refus: null,
    })
    .eq('id', droitId)

  if (droitError) return { error: droitError.message }

  // Mettre à jour le statut du membre
  const { error: membreError } = await supabase
    .from('membres')
    .update({ statut: 'actif' })
    .eq('id', membreId)

  if (membreError) return { error: membreError.message }

  revalidatePath('/admin/droits-inscription')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function refuserDroitInscription(droitId: string) {
  const result = await checkAdmin()
  if (!result) return { error: "Non autorisé" }
  
  const { supabase } = result

  const { error } = await supabase
    .from('droits_inscription')
    .update({
      statut: 'refuse',
      motif_refus: 'Paiement non confirmé par l\'administration',
    })
    .eq('id', droitId)

  if (error) return { error: error.message }

  revalidatePath('/admin/droits-inscription')
  return { success: true }
}
