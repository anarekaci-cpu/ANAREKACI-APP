'use server'

import { revalidatePath } from 'next/cache'
import { exigerMembreActif } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { declarerCotisations } from '@/services/paiements'

/**
 * Le membre déclare les mois payés ; le trésorier valide ensuite.
 * Corrections par rapport à l'ancienne version :
 *  - le montant n'est plus lu depuis le formulaire (modifiable par l'utilisateur) ;
 *  - un mois déjà payé ou déjà déclaré ne peut plus être déclaré une seconde fois ;
 *  - une seule action pour 1 ou N mois (avant : deux actions quasi identiques).
 */
export async function payerCotisations(formData: FormData) {
  const membre = await exigerMembreActif()
  const annee = Number(formData.get('annee'))
  const mois = formData.getAll('mois').map(Number)
  const r = declarerCotisations(membre.id, annee, mois, String(formData.get('methode') ?? ''), String(formData.get('reference') ?? '') || null)

  if (!r.ok) aller(`/cotisations?annee=${annee}`, { erreur: r.erreur })
  revalidatePath('/', 'layout')
  aller(`/cotisations?annee=${annee}`, { succes: `${r.data.crees} cotisation(s) déclarée(s). Elles seront validées par le trésorier.` })
}
