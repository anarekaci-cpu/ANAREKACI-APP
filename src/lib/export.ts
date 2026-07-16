import * as XLSX from 'xlsx'

export function exporterMembresEnExcel(membres: any[]) {
  const donnees = membres.map(m => ({
    'Numéro Membre': m.numero_membre,
    'Nom Complet': m.nom_complet,
    'Nom': m.nom,
    'Prénoms': m.prenoms,
    'Téléphone': m.telephone,
    'Sexe': m.sexe,
    'Commune/Quartier': m.commune_quartier,
    "Type d'activité": m.type_activite,
    'Statut': m.statut,
    'Rôle': m.role,
    'Date inscription': new Date(m.cree_le).toLocaleDateString('fr-FR'),
  }))

  const worksheet = XLSX.utils.json_to_sheet(donnees)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Membres')
  
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `membres_anareka_${date}.xlsx`)
}

export function exporterCotisationsEnExcel(cotisations: any[]) {
  const donnees = cotisations.map(c => ({
    'Membre': c.membre_nom,
    'Numéro Membre': c.membre_numero,
    'Année': c.annee,
    'Mois': c.mois,
    'Montant': c.montant,
    'Statut': c.statut,
    'Date Paiement': c.date_paiement ? new Date(c.date_paiement).toLocaleDateString('fr-FR') : 'Non payé',
  }))

  const worksheet = XLSX.utils.json_to_sheet(donnees)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotisations')
  
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `cotisations_anareka_${date}.xlsx`)
}

export function exporterPaiementsEnExcel(paiements: any[]) {
  const donnees = paiements.map(p => ({
    'Membre': p.membre_nom,
    'Numéro Membre': p.membre_numero,
    'Type': p.type,
    'Montant': p.montant,
    'Statut': p.statut,
    'Date Paiement': p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : 'En attente',
    'Référence': p.reference || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(donnees)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements')
  
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `paiements_anareka_${date}.xlsx`)
}

export function exporterEnCSV(donnees: any[], nomFichier: string) {
  const worksheet = XLSX.utils.json_to_sheet(donnees)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${nomFichier}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
