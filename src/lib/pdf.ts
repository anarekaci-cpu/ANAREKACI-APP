import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function genererRecuPaiement(data: {
  nom: string
  numeroMembre: string
  type: string
  montant: number
  date: string
  reference?: string
}) {
  const doc = new jsPDF()
  
  // En-tête
  doc.setFontSize(20)
  doc.setTextColor(46, 204, 113) // Vert ANAREKA
  doc.text('ANAREKA-CI', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Association Nationale des Révendeurs d\'Attiéké de Côte d\'Ivoire', 105, 28, { align: 'center' })
  
  // Titre
  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text('REÇU DE PAIEMENT', 105, 45, { align: 'center' })
  
  // Ligne de séparation
  doc.setDrawColor(230, 126, 34) // Orange ANAREKA
  doc.setLineWidth(0.5)
  doc.line(20, 50, 190, 50)
  
  // Informations du membre
  doc.setFontSize(11)
  doc.setTextColor(50)
  
  const membreInfo = [
    ['Nom :', data.nom],
    ['Numéro de membre :', data.numeroMembre],
    ['Date :', new Date(data.date).toLocaleDateString('fr-FR')],
    ['Référence :', data.reference || `REC-${Date.now()}`],
  ]
  
  let yPos = 60
  membreInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 30, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 70, yPos)
    yPos += 8
  })
  
  // Détails du paiement
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Détails du paiement', 30, yPos)
  yPos += 10
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const paiementInfo = [
    ['Type de paiement :', data.type],
    ['Montant :', `${data.montant.toLocaleString('fr-FR')} FCFA`],
  ]
  
  paiementInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 30, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 70, yPos)
    yPos += 8
  })
  
  // Montant en lettres
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Montant en lettres :', 30, yPos)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(convertirNombreEnLettres(data.montant), 30, yPos)
  
  // Footer
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text('Ce reçu est généré automatiquement par le système ANAREKA-CI', 105, 280, { align: 'center' })
  doc.text('Pour toute question, contactez le bureau de l\'association', 105, 285, { align: 'center' })
  
  return doc
}

function convertirNombreEnLettres(nombre: number): string {
  // Fonction simplifiée pour convertir les nombres en lettres
  // Pour une implémentation complète, utiliser une librairie comme n2words
  if (nombre === 0) return 'zéro'
  
  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
  const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']
  
  if (nombre < 10) return unites[nombre]
  if (nombre < 20) return 'dix' // Simplification
  if (nombre < 100) {
    const d = Math.floor(nombre / 10)
    const u = nombre % 10
    return dizaines[d] + (u ? '-' + unites[u] : '')
  }
  
  // Pour les montants plus élevés, retourner une version simplifiée
  return `${nombre} FCFA`
}

export function genererRecuCotisation(data: {
  nom: string
  numeroMembre: string
  mois: number
  annee: number
  montant: number
  date: string
}) {
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  
  return genererRecuPaiement({
    nom: data.nom,
    numeroMembre: data.numeroMembre,
    type: `Cotisation ${moisNoms[data.mois - 1]} ${data.annee}`,
    montant: data.montant,
    date: data.date,
    reference: `COT-${data.annee}-${data.mois}-${data.numeroMembre}`
  })
}

export function genererRecuDroitInscription(data: {
  nom: string
  numeroMembre: string
  montant: number
  date: string
}) {
  return genererRecuPaiement({
    nom: data.nom,
    numeroMembre: data.numeroMembre,
    type: 'Droit d\'inscription',
    montant: data.montant,
    date: data.date,
    reference: `DROIT-${data.numeroMembre}`
  })
}
