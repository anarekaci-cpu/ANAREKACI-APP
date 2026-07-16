'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function mettreAJourProfil(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const membreId = formData.get('membreId') as string
  const nom = formData.get('nom') as string
  const prenoms = formData.get('prenoms') as string
  const telephone = formData.get('telephone') as string
  const commune_quartier = formData.get('commune_quartier') as string
  const type_activite = formData.get('type_activite') as string

  const nom_complet = `${nom} ${prenoms}`.trim()

  const { error } = await supabase
    .from('membres')
    .update({
      nom,
      prenoms,
      nom_complet,
      telephone,
      commune_quartier,
      type_activite,
    })
    .eq('id', membreId)
    .eq('compte_id', user.id)

  if (error) {
    return redirect('/profil?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/profil')
  revalidatePath('/dashboard')
  redirect('/profil?success=Profil+mise+à+jour+avec+succès')
}
