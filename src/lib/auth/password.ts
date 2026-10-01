import 'server-only'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Hachage de mot de passe avec scrypt (intégré à Node, aucune dépendance).
 * Format stocké : "sel_hex:hash_hex". Le sel est aléatoire par mot de passe,
 * donc deux membres ayant le même mot de passe ont des hash différents.
 */
const LONGUEUR = 64

export function hasherMotDePasse(motDePasse: string): string {
  const sel = randomBytes(16)
  const hash = scryptSync(motDePasse, sel, LONGUEUR)
  return `${sel.toString('hex')}:${hash.toString('hex')}`
}

export function verifierMotDePasse(motDePasse: string, stocke: string): boolean {
  const [selHex, hashHex] = stocke.split(':')
  if (!selHex || !hashHex) return false
  const attendu = Buffer.from(hashHex, 'hex')
  const calcule = scryptSync(motDePasse, Buffer.from(selHex, 'hex'), attendu.length)
  // timingSafeEqual évite de révéler la longueur du préfixe correct par le temps de réponse
  return timingSafeEqual(attendu, calcule)
}

/** Mot de passe temporaire lisible (sans caractères ambigus 0/O, 1/l/I). */
export function genererMotDePasseTemporaire(longueur = 10): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const octets = randomBytes(longueur)
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join('')
}
