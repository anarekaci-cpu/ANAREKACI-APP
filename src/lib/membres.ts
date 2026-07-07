import type { SupabaseClient } from '@supabase/supabase-js'

export type Membre = {
  id: string
  compte_id: string
  identifiant: string
  nom_complet: string
  telephone: string | null
  email: string | null
  statut: 'actif' | 'en_attente' | 'suspendu'
  role: 'membre' | 'admin' | 'bureau' | 'tresorier'
}

const ROLES_ADMIN = new Set(['admin', 'bureau', 'tresorier'])

export function estAdmin(role: string | undefined | null) {
  return !!role && ROLES_ADMIN.has(role)
}

export async function getMembreParCompte(
  supabase: SupabaseClient,
  compteId: string
) {
  return supabase
    .from('membres')
    .select('*')
    .eq('compte_id', compteId)
    .maybeSingle()
}
