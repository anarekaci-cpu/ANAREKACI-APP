'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { creerFormation, supprimerFormation } from '@/services/contenu'

const PAGE = '/admin/formations'

export async function creer(formData: FormData) {
  await exigerPermission('contenu')
  const cap = String(formData.get('capacite') ?? '')
  const r = creerFormation({
    titre: String(formData.get('titre') ?? ''),
    description: String(formData.get('description') ?? '') || null,
    lieu: String(formData.get('lieu') ?? '') || null,
    date_debut: String(formData.get('date_debut') ?? '') || null,
    capacite: cap ? Number(cap) : null,
  })
  revalidatePath(PAGE)
  revalidatePath('/formations')
  if (!r.ok) aller(PAGE, { erreur: r.erreur })
  aller(PAGE, { succes: 'Formation créée.' })
}

export async function supprimer(formData: FormData) {
  await exigerPermission('contenu')
  supprimerFormation(String(formData.get('id') ?? ''))
  revalidatePath(PAGE)
  revalidatePath('/formations')
  aller(PAGE, { succes: 'Formation supprimée.' })
}
