import type { MethodePaiement, Role } from '@/config/association'

/**
 * Modèle de données. Chaque type correspond à une table de l'ancien schéma
 * Supabase (mêmes noms de colonnes) : le jour où on rebranche Supabase,
 * seul `lib/db/store.ts` change, pas les services ni les pages.
 */

export type StatutMembre = 'actif' | 'en_attente' | 'suspendu'
export type StatutDroit = 'non_paye' | 'en_attente_validation' | 'paye' | 'refuse'
export type StatutPaiement = 'en_attente' | 'valide' | 'refuse'
export type TypePaiement = 'droit_inscription' | 'cotisation'

export type MembreRow = {
  id: string
  numero_membre: string
  telephone: string
  /** hash scrypt "sel:hash" — ne JAMAIS envoyer au client */
  mot_de_passe_hash: string
  nom: string
  prenoms: string
  nom_complet: string
  email: string | null
  sexe: 'homme' | 'femme' | null
  commune_quartier: string | null
  type_activite: string | null
  statut: StatutMembre
  role: Role
  cree_le: string
}

/** Membre tel qu'exposé aux pages (DTO) : sans le hash du mot de passe. */
export type Membre = Omit<MembreRow, 'mot_de_passe_hash'>

export type DroitInscription = {
  id: string
  membre_id: string
  statut: StatutDroit
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
  type: TypePaiement
  montant: number
  methode: MethodePaiement
  reference: string | null
  /** Pour une cotisation : mois (1-12) et année concernés */
  mois: number | null
  annee: number | null
  statut: StatutPaiement
  date_paiement: string | null
  date_validation: string | null
  valide_par: string | null
  cree_le: string
}

export type Evenement = {
  id: string
  titre: string
  description: string | null
  lieu: string | null
  date_debut: string
  date_fin: string | null
  type: 'reunion' | 'assemblee' | 'formation' | 'evenement'
  cree_par: string | null
  cree_le: string
}

export type Notification = {
  id: string
  membre_id: string
  titre: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  lue: boolean
  cree_le: string
}

export type Formation = {
  id: string
  titre: string
  description: string | null
  lieu: string | null
  date_debut: string | null
  date_fin: string | null
  capacite: number | null
  ouvert_inscription: boolean
  fichier_url: string | null
  cree_le: string
}

export type InscriptionFormation = {
  id: string
  formation_id: string
  membre_id: string
  cree_le: string
}

export type Conversation = {
  id: string
  titre: string | null
  cree_par: string
  cree_le: string
  modifie_le: string
}

export type ConversationParticipant = {
  id: string
  conversation_id: string
  membre_id: string
  ajoute_le: string
}

export type Message = {
  id: string
  conversation_id: string
  envoye_par: string
  contenu: string
  date_envoi: string
  lu: boolean
}

export type Annonce = {
  id: string
  titre: string
  contenu: string
  epingle: boolean
  publie: boolean
  publie_le: string | null
  cree_le: string
  auteur_id: string | null
}

export type VisiteRecensement = {
  id: string
  point_id: string
  membre_id: string
  status: string | null
  visited_at: string
}

export type Database = {
  membres: MembreRow[]
  droits_inscription: DroitInscription[]
  cotisations: Cotisation[]
  paiements: Paiement[]
  evenements: Evenement[]
  notifications: Notification[]
  formations: Formation[]
  inscriptions_formation: InscriptionFormation[]
  conversations: Conversation[]
  conversation_participants: ConversationParticipant[]
  messages: Message[]
  annonces: Annonce[]
  visits_recensement: VisiteRecensement[]
}

export type TableName = keyof Database
