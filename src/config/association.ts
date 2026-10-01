/**
 * Configuration centrale de l'association.
 * Tous les montants et libellés sont définis ICI, nulle part ailleurs :
 * avant, 10000 / 1000 / 5000 / 2000 étaient codés en dur dans plusieurs pages
 * et se contredisaient (statistiques admin vs pages de paiement).
 */

export const ASSOCIATION = {
  sigle: 'ANAREKA-CI',
  nom: "Association Nationale des Revendeurs d'Attiéké de Côte d'Ivoire",
  devise: 'FCFA',
} as const

export const TARIFS = {
  droitInscription: 10_000,
  cotisationMensuelle: 1_000,
} as const

export const MOIS_NOMS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const

export const ROLES = ['membre', 'tresorier', 'secretaire', 'bureau', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  membre: 'Membre',
  tresorier: 'Trésorier',
  secretaire: 'Secrétaire',
  bureau: 'Bureau',
  admin: 'Administrateur',
}

export type Permission = 'membres' | 'paiements' | 'contenu' | 'rapports'

/** Qui peut faire quoi dans l'espace d'administration. */
const PERMISSIONS: Record<Permission, readonly Role[]> = {
  membres: ['admin', 'bureau'],
  paiements: ['admin', 'bureau', 'tresorier'],
  contenu: ['admin', 'bureau', 'secretaire'],
  rapports: ['admin', 'bureau', 'tresorier', 'secretaire'],
}

export function aPermission(role: Role | string | null | undefined, permission: Permission): boolean {
  return !!role && (PERMISSIONS[permission] as readonly string[]).includes(role)
}

/** Peut entrer dans l'espace /admin (au moins une permission). */
export function aAccesAdmin(role: Role | string | null | undefined): boolean {
  return !!role && role !== 'membre' && ROLES.includes(role as Role)
}

/** Rôles de direction (admin + bureau). */
export function estAdmin(role: Role | string | null | undefined): boolean {
  return role === 'admin' || role === 'bureau'
}

export const METHODES_PAIEMENT = ['mobile_money', 'especes', 'virement', 'autre'] as const
export type MethodePaiement = (typeof METHODES_PAIEMENT)[number]

export const METHODE_LABELS: Record<MethodePaiement, string> = {
  mobile_money: 'Mobile Money',
  especes: 'Espèces',
  virement: 'Virement',
  autre: 'Autre',
}

export function formatFCFA(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(montant).replace(/ | /g, ' ')} ${ASSOCIATION.devise}`
}
