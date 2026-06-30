'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const identifiant = formData.get('identifiant') as string
  const password = formData.get('password') as string

  const email = `${identifiant.trim().toLowerCase()}@asso.interne`

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect('/login?error=Identifiant+ou+mot+de+passe+incorrect')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const identifiant = formData.get('identifiant') as string
  const password = formData.get('password') as string
  const nom_complet = formData.get('nom_complet') as string
  const telephone = formData.get('telephone') as string

  const email = `${identifiant.trim().toLowerCase()}@asso.interne`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        identifiant: identifiant.trim().toLowerCase(),
        nom_complet,
        telephone,
      },
    },
  })

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}