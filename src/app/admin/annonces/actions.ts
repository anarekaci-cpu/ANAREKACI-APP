'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { basculerAnnonce, creerAnnonce, supprimerAnnonce } from '@/services/contenu'

const PAGE = '/admin/annonces'

export async function creer(formData: FormData) {
  const admin = await exigerPermission('contenu')
  const r = creerAnnonce(admin.id, {
    titre: String(formData.get('titre') ?? ''),
    contenu: String(formData.get('contenu') ?? ''),
    publie: formData.get('publie') === 'on',
    epingle: formData.get('epingle') === 'on',
  })
  revalidatePath(PAGE)
  revalidatePath('/annonces')
  if (!r.ok) aller(PAGE, { erreur: r.erreur })
  aller(PAGE, { succes: 'Annonce créée.' })
}

export async function basculer(formData: FormData) {
  await exigerPermission('contenu')
  const champ = formData.get('champ') === 'epingle' ? 'epingle' : 'publie'
  basculerAnnonce(String(formData.get('id') ?? ''), champ)
  revalidatePath(PAGE)
  revalidatePath('/annonces')
  aller(PAGE)
}

export async function supprimer(formData: FormData) {
  await exigerPermission('contenu')
  supprimerAnnonce(String(formData.get('id') ?? ''))
  revalidatePath(PAGE)
  revalidatePath('/annonces')
  aller(PAGE, { succes: 'Annonce supprimée.' })
}
