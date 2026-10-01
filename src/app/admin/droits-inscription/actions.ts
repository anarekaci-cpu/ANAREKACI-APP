'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { refuserDroit, validerDroit } from '@/services/droits'

export async function valider(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const r = validerDroit(String(formData.get('droitId') ?? ''), admin.id)
  revalidatePath('/admin/droits-inscription')
  if (!r.ok) aller('/admin/droits-inscription', { erreur: r.erreur })
  aller('/admin/droits-inscription', { succes: 'Adhésion validée : le membre est maintenant actif.' })
}

export async function refuser(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const r = refuserDroit(String(formData.get('droitId') ?? ''), admin.id, String(formData.get('motif') ?? ''))
  revalidatePath('/admin/droits-inscription')
  if (!r.ok) aller('/admin/droits-inscription', { erreur: r.erreur })
  aller('/admin/droits-inscription', { succes: 'Demande refusée.' })
}
