'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { genererNumeroMembre } from '@/lib/membres'

const DOMAINE = '@asso.interne'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const telephoneRaw = formData.get('telephone')
  const password = formData.get('password')

  if (typeof telephoneRaw !== 'string' || typeof password !== 'string') {
    return redirect('/login?error=Champs+manquants')
  }

  const telephone = telephoneRaw.trim().replace(/\s+/g, '')

  if (telephone.length < 8) {
    return redirect('/login?error=Telephone+invalide')
  }

  const email = `${telephone}${DOMAINE}`
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect('/login?error=Telephone+ou+mot+de+passe+incorrect')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const nom = formData.get('nom')
  const prenoms = formData.get('prenoms')
  const sexe = formData.get('sexe')
  const telephoneRaw = formData.get('telephone')
  const commune_quartier = formData.get('commune_quartier')
  const type_activite = formData.get('type_activite')
  const password = formData.get('password')

  if (
    typeof nom !== 'string' ||
    typeof prenoms !== 'string' ||
    typeof sexe !== 'string' ||
    typeof telephoneRaw !== 'string' ||
    typeof commune_quartier !== 'string' ||
    typeof type_activite !== 'string' ||
    typeof password !== 'string'
  ) {
    return redirect('/register?error=' + encodeURIComponent('Champs obligatoires manquants'))
  }

  const telephone = telephoneRaw.trim().replace(/\s+/g, '')

  if (telephone.length < 8) {
    return redirect('/register?error=' + encodeURIComponent('Téléphone invalide'))
  }

  if (password.length < 8) {
    return redirect('/register?error=' + encodeURIComponent('Mot de passe trop court (8 min)'))
  }

  const nom_complet = `${nom} ${prenoms}`.trim()
  const email = `${telephone}${DOMAINE}`
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        identifiant: telephone,
        nom_complet,
        telephone,
      },
    },
  })

  if (error) {
    console.error('ERREUR SIGNUP:', JSON.stringify(error))
    return redirect('/register?error=' + encodeURIComponent(error.message || JSON.stringify(error)))
  }

  if (!data.user) {
    return redirect('/register?error=' + encodeURIComponent('Compte créé mais session introuvable. Connectez-vous.'))
  }

  const admin = createAdminClient()
  
  // Générer le numéro de membre unique
  const numero_membre = await genererNumeroMembre(admin)
  
  const { error: membreError } = await admin.from('membres').insert({
    compte_id: data.user.id,
    identifiant: telephone,
    numero_membre,
    nom,
    prenoms,
    nom_complet,
    telephone,
    email,
    sexe,
    commune_quartier,
    type_activite,
    statut: 'en_attente',
    role: 'membre',
  })

  if (membreError) {
    console.error('ERREUR CREATION MEMBRE:', JSON.stringify(membreError))
    return redirect('/register?error=' + encodeURIComponent('Compte créé, mais la fiche membre n\'a pas pu être enregistrée. Contactez le bureau.'))
  }

  revalidatePath('/', 'layout')
  redirect('/droit-inscription')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}