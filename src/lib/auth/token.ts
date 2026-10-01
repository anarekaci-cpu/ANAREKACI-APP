import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Jeton de session signé (HMAC-SHA256) : "payload_base64url.signature".
 * Stateless : rien n'est stocké côté serveur, le serveur vérifie simplement
 * la signature avec SESSION_SECRET. Un cookie forgé ou modifié est rejeté.
 * Ce module est utilisé à la fois par le proxy et par la couche DAL.
 */

export const COOKIE_SESSION = 'anareka_session'
export const DUREE_SESSION_SECONDES = 60 * 60 * 24 * 7 // 7 jours

type Payload = { sub: string; exp: number }

let secretCache: Buffer | null = null

function secret(): Buffer {
  if (secretCache) return secretCache

  const env = process.env.SESSION_SECRET
  if (env && env.length >= 32) {
    secretCache = Buffer.from(env, 'utf8')
    return secretCache
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET manquant ou trop court (32 caractères minimum). Générez-en un avec : openssl rand -base64 48'
    )
  }

  // Développement uniquement : clé aléatoire persistée pour survivre aux rechargements.
  const dossier = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), '.data')
  const fichier = path.join(dossier, 'session.key')
  if (!fs.existsSync(fichier)) {
    fs.mkdirSync(dossier, { recursive: true })
    fs.writeFileSync(fichier, randomBytes(48).toString('base64url'), { mode: 0o600 })
  }
  secretCache = Buffer.from(fs.readFileSync(fichier, 'utf8'), 'utf8')
  return secretCache
}

function signer(donnees: string): string {
  return createHmac('sha256', secret()).update(donnees).digest('base64url')
}

export function creerJeton(membreId: string): string {
  const payload: Payload = {
    sub: membreId,
    exp: Math.floor(Date.now() / 1000) + DUREE_SESSION_SECONDES,
  }
  const corps = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${corps}.${signer(corps)}`
}

/** Retourne l'identifiant du membre si le jeton est authentique et non expiré. */
export function lireJeton(jeton: string | undefined | null): string | null {
  if (!jeton) return null
  const [corps, signature] = jeton.split('.')
  if (!corps || !signature) return null

  const attendu = Buffer.from(signer(corps))
  const recu = Buffer.from(signature)
  if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) return null

  try {
    const payload = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8')) as Payload
    if (typeof payload.sub !== 'string' || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.sub
  } catch {
    return null
  }
}
