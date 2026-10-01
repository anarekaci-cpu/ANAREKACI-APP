'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { creerEvenement, supprimerEvenement } from '@/services/contenu'

const PAGE = '/admin/evenements'

export async function creer(formData: FormData) {
  const admin = await exigerPermission('contenu')
  const r = creerEvenement(admin.id, {
    titre: String(formData.get('titre') ?? ''),
    description: String(formData.get('description') ?? '') || null,
    lieu: String(formData.get('lieu') ?? '') || null,
    date_debut: String(formData.get('date_debut') ?? ''),
    date_fin: String(formData.get('date_fin') ?? '') || null,
    type: String(formData.get('type') ?? ''),
  })
  revalidatePath(PAGE)
  revalidatePath('/evenements')
  if (!r.ok) aller(PAGE, { erreur: r.erreur })
  aller(PAGE, { succes: 'Événement créé.' })
}

export async function supprimer(formData: FormData) {
  await exigerPermission('contenu')
  supprimerEvenement(String(formData.get('id') ?? ''))
  revalidatePath(PAGE)
  revalidatePath('/evenements')
  aller(PAGE, { succes: 'Événement supprimé.' })
}
