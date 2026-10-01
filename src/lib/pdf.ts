import jsPDF from 'jspdf'
import { ASSOCIATION, MOIS_NOMS, formatFCFA } from '@/config/association'

/* ───────── Nombre en lettres (français) ─────────
 * Remplace l'ancienne version « simplifiée » qui affichait « 10000 FCFA » en chiffres
 * pour tout montant ≥ 100 et « dix » pour tout nombre entre 10 et 19. */

const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

function moinsDeCent(n: number, terminal: boolean): string {
  if (n < 17) return UNITES[n]
  if (n < 20) return `dix-${UNITES[n - 10]}`
  if (n < 70) {
    const d = Math.floor(n / 10)
    const u = n % 10
    if (u === 0) return DIZAINES[d]
    return DIZAINES[d] + (u === 1 ? ' et un' : `-${UNITES[u]}`)
  }
  if (n < 80) {
    const r = n - 60
    return r === 11 ? 'soixante et onze' : `soixante-${moinsDeCent(r, false)}`
  }
  if (n === 80) return terminal ? 'quatre-vingts' : 'quatre-vingt'
  return `quatre-vingt-${moinsDeCent(n - 80, false)}`
}

function moinsDeMille(n: number, terminal: boolean): string {
  const c = Math.floor(n / 100)
  const r = n % 100
  if (c === 0) return moinsDeCent(r, terminal)
  if (c === 1) return r ? `cent ${moinsDeCent(r, terminal)}` : 'cent'
  return r ? `${UNITES[c]} cent ${moinsDeCent(r, terminal)}` : `${UNITES[c]} cent${terminal ? 's' : ''}`
}

export function nombreEnLettres(nombre: number): string {
  const n = Math.floor(Math.abs(nombre))
  if (n === 0) return 'zéro'
  const milliards = Math.floor(n / 1e9)
  const millions = Math.floor(n / 1e6) % 1000
  const milliers = Math.floor(n / 1e3) % 1000
  const reste = n % 1000
  const parties: string[] = []
  if (milliards) parties.push(`${moinsDeMille(milliards, true)} milliard${milliards > 1 ? 's' : ''}`)
  if (millions) parties.push(millions === 1 ? 'un million' : `${moinsDeMille(millions, true)} millions`)
  if (milliers) parties.push(milliers === 1 ? 'mille' : `${moinsDeMille(milliers, false)} mille`)
  if (reste) parties.push(moinsDeMille(reste, true))
  return parties.join(' ')
}

/* ───────── Reçus PDF ───────── */

export type DonneesRecu = {
  nom: string
  numeroMembre: string
  libelle: string
  montant: number
  date: string
  reference: string
}

const VERT: [number, number, number] = [26, 61, 43]
const OR: [number, number, number] = [201, 168, 76]

export function genererRecu(d: DonneesRecu) {
  const doc = new jsPDF()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...VERT)
  doc.text(ASSOCIATION.sigle, 105, 22, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(ASSOCIATION.nom, 105, 30, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text('REÇU DE PAIEMENT', 105, 46, { align: 'center' })

  doc.setDrawColor(...OR)
  doc.setLineWidth(0.8)
  doc.line(20, 52, 190, 52)

  const lignes: [string, string][] = [
    ['Reçu de :', d.nom],
    ['N° de membre :', d.numeroMembre],
    ['Date :', new Date(d.date).toLocaleDateString('fr-FR')],
    ['Référence :', d.reference],
    ['Objet :', d.libelle],
    ['Montant :', formatFCFA(d.montant)],
  ]
  let y = 66
  doc.setFontSize(11)
  for (const [label, valeur] of lignes) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50)
    doc.text(label, 30, y)
    doc.setFont('helvetica', 'normal')
    doc.text(valeur, 75, y)
    y += 9
  }

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Arrêté le présent reçu à la somme de :', 30, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  const lettres = `${nombreEnLettres(d.montant)} francs CFA`
  doc.text(doc.splitTextToSize(lettres.charAt(0).toUpperCase() + lettres.slice(1), 150), 30, y)

  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text(`Reçu généré par la plateforme ${ASSOCIATION.sigle}`, 105, 280, { align: 'center' })
  doc.text("Pour toute question, contactez le bureau de l'association", 105, 285, { align: 'center' })
  return doc
}

export function genererRecuCotisation(d: { nom: string; numeroMembre: string; mois: number; annee: number; montant: number; date: string }) {
  return genererRecu({
    nom: d.nom,
    numeroMembre: d.numeroMembre,
    libelle: `Cotisation ${MOIS_NOMS[d.mois - 1]} ${d.annee}`,
    montant: d.montant,
    date: d.date,
    reference: `COT-${d.annee}-${String(d.mois).padStart(2, '0')}-${d.numeroMembre}`,
  })
}

export function genererRecuDroitInscription(d: { nom: string; numeroMembre: string; montant: number; date: string }) {
  return genererRecu({
    nom: d.nom,
    numeroMembre: d.numeroMembre,
    libelle: "Droit d'inscription",
    montant: d.montant,
    date: d.date,
    reference: `DROIT-${d.numeroMembre}`,
  })
}

/** Carte de membre au format carte bancaire (85,6 × 54 mm), recto. */
export function genererCarteMembre(d: { nom: string; numeroMembre: string; depuis: string; role: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] })
  doc.setFillColor(...VERT)
  doc.rect(0, 0, 85.6, 54, 'F')
  doc.setFillColor(...OR)
  doc.rect(0, 0, 85.6, 2.2, 'F')
  doc.rect(0, 51.8, 85.6, 2.2, 'F')

  doc.setTextColor(232, 201, 122)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(ASSOCIATION.sigle, 6, 13)
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  doc.text('CARTE DE MEMBRE', 6, 17)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(d.nom.toUpperCase(), 6, 33, { maxWidth: 74 })
  doc.setFont('courier', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(232, 201, 122)
  doc.text(d.numeroMembre, 6, 41)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(255, 255, 255)
  doc.text(`Membre depuis ${new Date(d.depuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} · ${d.role}`, 6, 47)
  return doc
}
