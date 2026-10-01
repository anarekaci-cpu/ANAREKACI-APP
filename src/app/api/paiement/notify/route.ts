import { NextResponse, type NextRequest } from 'next/server'
import { createCinetPayConfig, cinetPayConfigure, verifierStatutPaiement } from '@/lib/cinetpay'
import { validerParReference } from '@/services/paiements'

/**
 * Notification (IPN) CinetPay.
 *
 * Ancienne version : n'importe qui pouvait envoyer `{status:"ACCEPTED", transaction_id:"…"}`
 * et faire valider un paiement sans payer, car la requête n'était ni authentifiée ni vérifiée.
 * Maintenant : on ne croit JAMAIS le corps de la requête. On redemande le statut réel à CinetPay
 * avec nos identifiants ; la notification ne sert que de déclencheur.
 * Sans configuration CinetPay (mode local hors-ligne), la route refuse tout.
 */
export async function POST(request: NextRequest) {
  if (!cinetPayConfigure()) return NextResponse.json({ error: 'CinetPay non configuré' }, { status: 503 })

  const corps = await request.json().catch(() => null)
  const transactionId = typeof corps?.transaction_id === 'string' ? corps.transaction_id : null
  if (!transactionId) return NextResponse.json({ error: 'transaction_id manquant' }, { status: 400 })

  const config = createCinetPayConfig(request.nextUrl.origin)
  const verif = await verifierStatutPaiement(config, transactionId).catch(() => null)

  if (verif?.success && verif.statut === 'ACCEPTED') {
    const r = validerParReference(transactionId)
    if (!r.ok) return NextResponse.json({ error: r.erreur }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
