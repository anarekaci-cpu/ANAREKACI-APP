'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const DOMAINE = '@asso.interne'
const IDENTIFIANT_VALIDE = /^[a-z0-9._-]+$/

export async function login(formData: FormData) {
  const supabase = await createClient()
  const identifiantRaw = formData.get('identifiant')
  const password = formData.get('password')

  if (typeof identifiantRaw !== 'string' || typeof password !== 'string') {
    return redirect('/login?error=Champs+manquants')
  }

  const identifiant = identifiantRaw.trim().toLowerCase()
  if (!IDENTIFIANT_VALIDE.test(identifiant)) {
    return redirect('/login?error=Identifiant+ou+mot+de+passe+incorrect')
  }

  const email = `${identifiant}${DOMAINE}`
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect('/login?error=Identifiant+ou+mot+de+passe+incorrect')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const identifiantRaw = formData.get('identifiant')
  const password = formData.get('password')
  const nom_complet = formData.get('nom_complet')
  const telephone = formData.get('telephone')

  if (
    typeof identifiantRaw !== 'string' ||
    typeof password !== 'string' ||
    typeof nom_complet !== 'string'
  ) {
    return redirect('/register?error=' + encodeURIComponent('Champs obligatoires manquants'))
  }

  const identifiant = identifiantRaw.trim().toLowerCase()
  if (!IDENTIFIANT_VALIDE.test(identifiant)) {
    return redirect('/register?error=' + encodeURIComponent('Identifiant invalide : lettres, chiffres, points, tirets uniquement'))
  }

  const email = `${identifiant}${DOMAINE}`
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        identifiant,
        nom_complet,
        telephone: typeof telephone === 'string' ? telephone : '',
      },
    },
  })

  if (error) {
    const msg = error.message.includes('already registered')
      ? 'Cet identifiant est déjà utilisé'
      : "Erreur lors de l'inscription, réessayez"
    return redirect('/register?error=' + encodeURIComponent(msg))
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}