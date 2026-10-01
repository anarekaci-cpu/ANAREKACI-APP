'use server'

import { revalidatePath } from 'next/cache'
import { exigerMembreActif } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { desinscrireDeFormation, inscrireAFormation } from '@/services/contenu'

export async function sInscrire(formData: FormData) {
  const membre = await exigerMembreActif()
  const formationId = String(formData.get('formationId') ?? '')
  const r = inscrireAFormation(formationId, membre.id)
  revalidatePath(`/formations/${formationId}`)
  if (!r.ok) aller(`/formations/${formationId}`, { erreur: r.erreur })
  aller(`/formations/${formationId}`, { succes: 'Inscription enregistrée.' })
}

export async function seDesinscrire(formData: FormData) {
  const membre = await exigerMembreActif()
  const formationId = String(formData.get('formationId') ?? '')
  desinscrireDeFormation(formationId, membre.id)
  revalidatePath(`/formations/${formationId}`)
  aller(`/formations/${formationId}`, { succes: 'Inscription annulée.' })
}
