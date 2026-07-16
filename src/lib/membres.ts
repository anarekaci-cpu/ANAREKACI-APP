import type { SupabaseClient } from '@supabase/supabase-js'

export type Membre = {
  id: string
  compte_id: string
  identifiant: string
  numero_membre: string | null
  nom: string
  prenoms: string | null
  nom_complet: string
  telephone: string | null
  email: string | null
  sexe: 'homme' | 'femme' | null
  commune_quartier: string | null
  type_activite: string | null
  statut: 'actif' | 'en_attente' | 'suspendu'
  role: 'membre' | 'admin' | 'bureau'
  cree_le: string | null
}

export type DroitInscription = {
  id: string
  membre_id: string
  statut: 'non_paye' | 'en_attente_validation' | 'paye' | 'refuse'
  montant: number
  date_paiement: string | null
  date_validation: string | null
  valide_par: string | null
  motif_refus: string | null
  cree_le: string
}

export type Cotisation = {
  id: string
  membre_id: string
  annee: number
  mois: number
  statut: 'non_paye' | 'paye'
  montant: number
  date_paiement: string | null
  cree_le: string
}

export type Paiement = {
  id: string
  membre_id: string
  type: 'droit_inscription' | 'cotisation'
  montant: number
  methode: 'mobile_money' | 'especes' | 'virement' | 'autre'
  reference: string | null
  statut: 'en_attente' | 'valide' | 'refuse'
  date_paiement: string | null
  date_validation: string | null
  valide_par: string | null
  cree_le: string
}

const ROLES_ADMIN = new Set(['admin', 'bureau'])

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

export async function genererNumeroMembre(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)
  const { count } = await supabase
    .from('membres')
    .select('*', { count: 'exact', head: true })
  
  const sequence = (count || 0) + 1
  return `AN${year}${sequence.toString().padStart(4, '0')}`
}
