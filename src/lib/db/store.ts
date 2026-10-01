import 'server-only'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { Database } from './types'
import { creerBaseInitiale } from './seed'

/**
 * Stockage local : un fichier JSON (par défaut `.data/db.json`, ignoré par git).
 *
 * Pourquoi un fichier et pas SQLite ? Zéro dépendance native à compiler,
 * aucun service à lancer : `npm run dev` suffit. Pour une association de
 * quelques centaines de membres c'est largement suffisant en phase de
 * développement. Les opérations sont SYNCHRONES : Node étant mono-thread,
 * lecture-modification-écriture ne peut donc pas être entrecoupée par une
 * autre requête (ce qui corrigeait déjà la course sur `genererNumeroMembre`).
 *
 * Écriture atomique : on écrit dans un fichier temporaire puis on renomme,
 * pour ne jamais laisser un JSON à moitié écrit en cas de coupure.
 */

const DOSSIER = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), '.data')
const FICHIER = path.join(DOSSIER, 'db.json')

export const uid = () => randomUUID()
export const maintenant = () => new Date().toISOString()

function ecrire(db: Database) {
  fs.mkdirSync(DOSSIER, { recursive: true })
  const tmp = `${FICHIER}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8')
  fs.renameSync(tmp, FICHIER)
}

function lireFichier(): Database {
  if (!fs.existsSync(FICHIER)) {
    const db = creerBaseInitiale()
    ecrire(db)
    return db
  }
  return JSON.parse(fs.readFileSync(FICHIER, 'utf8')) as Database
}

/** Lecture seule. Ne modifiez pas l'objet retourné : utilisez `modifier`. */
export function lire(): Readonly<Database> {
  return lireFichier()
}

/** Lecture + modification + écriture en une seule opération indivisible. */
export function modifier<T>(fn: (db: Database) => T): T {
  const db = lireFichier()
  const resultat = fn(db)
  ecrire(db)
  return resultat
}
