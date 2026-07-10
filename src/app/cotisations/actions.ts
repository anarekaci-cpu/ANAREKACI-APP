'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
  const montant = parseInt(formData.get('montant') as string)
  const methode = formData.get('methode') as string
  const reference = formData.get('reference') as string | null

  if (!mois || !annee || !montant || !methode) {
    return redirect('/cotisations/payer?error=Champs+manquants')
  }

  const admin = createAdminClient()

  // Créer l'enregistrement de paiement
  const { error: paiementError } = await admin
    .from('paiements')
    .insert({
      membre_id: membre.id,
      type: 'cotisation',
      montant,
      methode,
      reference,
      statut: 'en_attente',
      date_paiement: new Date().toISOString(),
    })

  if (paiementError) {
    console.error('Erreur enregistrement paiement:', paiementError)
    return redirect('/cotisations/payer?error=Erreur+enregistrement')
  }

  // Mettre à jour la cotisation
  const { error: cotisationError } = await admin
    .from('cotisations')
    .update({
      statut: 'paye',
      date_paiement: new Date().toISOString(),
    })
    .eq('membre_id', membre.id)
    .eq('annee', annee)
    .eq('mois', mois)

  if (cotisationError) {
    console.error('Erreur mise à jour cotisation:', cotisationError)
    return redirect('/cotisations/payer?error=Erreur+mise+à+jour')
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
    .eq('type', 'cotisation')
    .order('cree_le', { ascending: false })
    .limit(1)

  if (validationError) {
    console.error('Erreur validation paiement:', validationError)
  }

  revalidatePath('/cotisations')
  redirect('/cotisations?success=Paiement+réussi')
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
  const reference = formData.get('reference') as string | null

  if (!moisSelectionnes.length || !annee || !methode) {
    return redirect('/cotisations/payer-multiple?error=Champs+manquants')
  }

  const admin = createAdminClient()
  const montantParMois = 1000
  const montantTotal = moisSelectionnes.length * montantParMois

  // Créer un paiement global
  const { error: paiementError } = await admin
    .from('paiements')
    .insert({
      membre_id: membre.id,
      type: 'cotisation',
      montant: montantTotal,
      methode,
      reference,
      statut: 'en_attente',
      date_paiement: new Date().toISOString(),
    })

  if (paiementError) {
    console.error('Erreur enregistrement paiement:', paiementError)
    return redirect('/cotisations/payer-multiple?error=Erreur+enregistrement')
  }

  // Mettre à jour toutes les cotisations sélectionnées
  const { error: cotisationError } = await admin
    .from('cotisations')
    .update({
      statut: 'paye',
      date_paiement: new Date().toISOString(),
    })
    .eq('membre_id', membre.id)
    .eq('annee', annee)
    .in('mois', moisSelectionnes.map(Number))

  if (cotisationError) {
    console.error('Erreur mise à jour cotisations:', cotisationError)
    return redirect('/cotisations/payer-multiple?error=Erreur+mise+à+jour')
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
    .eq('type', 'cotisation')
    .order('cree_le', { ascending: false })
    .limit(1)

  if (validationError) {
    console.error('Erreur validation paiement:', validationError)
  }

  revalidatePath('/cotisations')
  redirect('/cotisations?success=Paiements+réussis')
}
