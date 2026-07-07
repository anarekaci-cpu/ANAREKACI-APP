'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
  const nom_complet = formData.get('nom_complet')
  const telephoneRaw = formData.get('telephone')
  const password = formData.get('password')

  if (
    typeof nom_complet !== 'string' ||
    typeof telephoneRaw !== 'string' ||
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
  const { error: membreError } = await admin.from('membres').insert({
    compte_id: data.user.id,
    identifiant: telephone,
    nom_complet,
    telephone,
    email,
    statut: 'en_attente',
    role: 'membre',
  })

  if (membreError) {
    console.error('ERREUR CREATION MEMBRE:', JSON.stringify(membreError))
    return redirect('/register?error=' + encodeURIComponent('Compte créé, mais la fiche membre n\'a pas pu être enregistrée. Contactez le bureau.'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}