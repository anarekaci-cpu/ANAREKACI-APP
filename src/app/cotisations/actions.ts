'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MONTANT_COTISATION_MENSUELLE = 1000 // FCFA — fixé côté serveur

export async function payerCotisation(formData: FormData) {
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

  const mois = parseInt(formData.get('mois') as string)
  const annee = parseInt(formData.get('annee') as string)
  const methode = formData.get('methode') as string
  const referenceUtilisateur = formData.get('reference') as string | null

  if (!mois || !annee || !methode) {
    return redirect('/cotisations/payer?error=Champs+manquants')
  }

  const admin = createAdminClient()

  // On encode le(s) mois et l'année dans "reference" pour que l'admin
  // sache exactement quelle cotisation valider plus tard.
  const referenceComplete = `mois=${mois};annee=${annee};ref=${referenceUtilisateur || ''}`

  const { error: paiementError } = await admin
    .from('paiements')
    .insert({
      membre_id: membre.id,
      type: 'cotisation',
      montant: MONTANT_COTISATION_MENSUELLE,
      methode,
      reference: referenceComplete,
      statut: 'en_attente',
      date_paiement: new Date().toISOString(),
    })

  if (paiementError) {
    console.error('Erreur enregistrement paiement:', paiementError)
    return redirect('/cotisations/payer?error=Erreur+enregistrement')
  }

  revalidatePath('/cotisations')
  redirect('/cotisations?success=Déclaration+enregistrée,+en+attente+de+validation+par+un+admin')
}

export async function payerCotisationsMultiples(formData: FormData) {
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

  const moisSelectionnes = formData.getAll('mois') as string[]
  const annee = parseInt(formData.get('annee') as string)
  const methode = formData.get('methode') as string
  const referenceUtilisateur = formData.get('reference') as string | null

  if (!moisSelectionnes.length || !annee || !methode) {
    return redirect('/cotisations/payer-multiple?error=Champs+manquants')
  }

  const admin = createAdminClient()
  const montantTotal = moisSelectionnes.length * MONTANT_COTISATION_MENSUELLE

  // Même format que ci-dessus, avec plusieurs mois séparés par des virgules.
  const referenceComplete = `mois=${moisSelectionnes.join(',')};annee=${annee};ref=${referenceUtilisateur || ''}`

  const { error: paiementError } = await admin
    .from('paiements')
    .insert({
      membre_id: membre.id,
      type: 'cotisation',
      montant: montantTotal,
      methode,
      reference: referenceComplete,
      statut: 'en_attente',
      date_paiement: new Date().toISOString(),
    })

  if (paiementError) {
    console.error('Erreur enregistrement paiement:', paiementError)
    return redirect('/cotisations/payer-multiple?error=Erreur+enregistrement')
  }

  revalidatePath('/cotisations')
  redirect('/cotisations?success=Déclaration+enregistrée,+en+attente+de+validation+par+un+admin')
}