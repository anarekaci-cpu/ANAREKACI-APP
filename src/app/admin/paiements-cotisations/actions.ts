'use server'

import { revalidatePath } from 'next/cache'
import { exigerPermission } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { refuserPaiement, validerPaiement } from '@/services/paiements'

const PAGE = '/admin/paiements-cotisations'

export async function validerUnPaiement(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const r = validerPaiement(String(formData.get('paiementId') ?? ''), admin.id)
  revalidatePath(PAGE)
  if (!r.ok) aller(PAGE, { erreur: r.erreur })
  aller(PAGE, { succes: 'Paiement validé.' })
}

export async function refuserUnPaiement(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const r = refuserPaiement(String(formData.get('paiementId') ?? ''), admin.id, String(formData.get('motif') ?? ''))
  revalidatePath(PAGE)
  if (!r.ok) aller(PAGE, { erreur: r.erreur })
  aller(PAGE, { succes: 'Paiement refusé.' })
}

/** Valide d'un coup tous les paiements en attente cochés. */
export async function validerSelection(formData: FormData) {
  const admin = await exigerPermission('paiements')
  const ids = formData.getAll('paiementId').map(String)
  if (ids.length === 0) aller(PAGE, { erreur: 'Aucun paiement sélectionné.' })
  let ok = 0
  for (const id of ids) if (validerPaiement(id, admin.id).ok) ok++
  revalidatePath(PAGE)
  aller(PAGE, { succes: `${ok} paiement(s) validé(s).` })
}
