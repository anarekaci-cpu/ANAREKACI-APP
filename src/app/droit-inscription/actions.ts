'use server'

import { revalidatePath } from 'next/cache'
import { exigerMembre } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { declarerPaiementDroit } from '@/services/droits'

/**
 * Déclaration d'un paiement du droit d'inscription. Le membre ne fait que DÉCLARER :
 * le bureau valide ensuite (voir /admin/droits-inscription). Le montant est fixé côté serveur.
 */
export async function declarerPaiement(formData: FormData) {
  const membre = await exigerMembre()
  const methode = String(formData.get('methode') ?? '')
  const reference = String(formData.get('reference') ?? '') || null

  const r = declarerPaiementDroit(membre.id, methode, reference)
  if (!r.ok) aller('/droit-inscription/payer', { erreur: r.erreur })

  revalidatePath('/', 'layout')
  aller('/dashboard', { succes: "Déclaration enregistrée : le bureau va valider votre droit d'inscription." })
}

/** Bouton « J'ai déjà payé à l'association » : équivaut à un paiement en espèces à valider. */
export async function declarerPaiementEspeces() {
  const membre = await exigerMembre()
  const r = declarerPaiementDroit(membre.id, 'especes', null)
  if (!r.ok) aller('/droit-inscription', { erreur: r.erreur })
  revalidatePath('/', 'layout')
  aller('/dashboard', { succes: "Déclaration enregistrée : le bureau va valider votre droit d'inscription." })
}
