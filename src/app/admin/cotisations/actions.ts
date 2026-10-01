'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { envoyerRappelsCotisation } from '@/services/cotisations'

export async function envoyerRappels(formData: FormData) {
  await exigerPermission('paiements')
  const annee = Number(formData.get('annee'))
  const mois = Number(formData.get('mois'))
  if (!Number.isInteger(mois) || mois < 1 || mois > 12 || !Number.isInteger(annee)) aller('/admin/cotisations', { erreur: 'Période invalide.' })
  const n = envoyerRappelsCotisation(annee, mois)
  revalidatePath('/admin/cotisations')
  aller(`/admin/cotisations?annee=${annee}`, { succes: n ? `${n} rappel(s) envoyé(s).` : 'Aucun rappel à envoyer (tout le monde est à jour ou déjà relancé).' })
}
