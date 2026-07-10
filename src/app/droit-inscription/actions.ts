'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function declarerPaiementExterne() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: membre } = await supabase
    .from('membres')
    .select('*')
    .eq('compte_id', user.id)
    .single()

  if (!membre) {
    return redirect('/attente-validation')
  }

  const admin = createAdminClient()
  
  const { error } = await admin
    .from('droits_inscription')
    .update({
      statut: 'en_attente_validation',
    })
    .eq('membre_id', membre.id)

  if (error) {
    console.error('Erreur déclaration paiement:', error)
    return redirect('/droit-inscription?error=' + encodeURIComponent('Erreur lors de la déclaration'))
  }

  revalidatePath('/droit-inscription')
  redirect('/droit-inscription')
}

export async function enregistrerPaiementDroitInscription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: membre } = await supabase
    .from('membres')
    .select('*')
    .eq('compte_id', user.id)
    .single()

  if (!membre) {
    return redirect('/attente-validation')
  }

  const methode = formData.get('methode') as string
  const reference = formData.get('reference') as string | null
  const montant = parseInt(formData.get('montant') as string)

  if (!methode || !montant) {
    return redirect('/droit-inscription/payer?error=Champs+manquants')
  }

  const admin = createAdminClient()

  // Créer l'enregistrement de paiement
  const { error: paiementError } = await admin
    .from('paiements')
    .insert({
      membre_id: membre.id,
      type: 'droit_inscription',
      montant,
      methode,
      reference,
      statut: 'en_attente',
      date_paiement: new Date().toISOString(),
    })

  if (paiementError) {
    console.error('Erreur enregistrement paiement:', paiementError)
    return redirect('/droit-inscription/payer?error=Erreur+enregistrement')
  }

  // Mettre à jour le droit d'inscription
  const { error: droitError } = await admin
    .from('droits_inscription')
    .update({
      statut: 'paye',
      date_paiement: new Date().toISOString(),
      date_validation: new Date().toISOString(),
      valide_par: membre.id, // Auto-validation pour le paiement en ligne
    })
    .eq('membre_id', membre.id)

  if (droitError) {
    console.error('Erreur mise à jour droit:', droitError)
    return redirect('/droit-inscription/payer?error=Erreur+mise+à+jour')
  }

  // Valider automatiquement le paiement
  const { error: validationError } = await admin
    .from('paiements')
    .update({
      statut: 'valide',
      date_validation: new Date().toISOString(),
      valide_par: membre.id,
    })
    .eq('membre_id', membre.id)
    .eq('type', 'droit_inscription')
    .order('cree_le', { ascending: false })
    .limit(1)

  if (validationError) {
    console.error('Erreur validation paiement:', validationError)
  }

  // Mettre à jour le statut du membre
  await admin
    .from('membres')
    .update({ statut: 'actif' })
    .eq('id', membre.id)

  revalidatePath('/droit-inscription')
  revalidatePath('/dashboard')
  redirect('/dashboard?success=Paiement+réussi')
}
