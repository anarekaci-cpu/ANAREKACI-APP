// Intégration CinetPay (paiement en ligne). Inactive tant que les variables d'environnement
// CINETPAY_* ne sont pas renseignées : l'application fonctionne alors en mode « déclaration
// + validation par le trésorier ».

const CINETPAY_API_BASE = 'https://api.cinetpay.com/v1'

export interface CinetPayConfig {
  apiKey: string
  siteId: string
  secretKey: string
  notifyUrl: string
  returnUrl: string
  cancelUrl: string
}

export interface PaymentRequest {
  transactionId: string
  amount: number
  currency?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  description: string
  metadata?: Record<string, string | number>
}

export interface PaymentResponse {
  success: boolean
  message: string
  paymentUrl?: string
  transactionId?: string
}

export function cinetPayConfigure(): boolean {
  return !!(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID && process.env.CINETPAY_SECRET_KEY)
}

export function createCinetPayConfig(baseUrl: string): CinetPayConfig {
  // Les clés restent côté serveur (l'ancienne clé NEXT_PUBLIC_… était exposée à tous les visiteurs).
  return {
    apiKey: process.env.CINETPAY_API_KEY ?? '',
    siteId: process.env.CINETPAY_SITE_ID ?? '',
    secretKey: process.env.CINETPAY_SECRET_KEY ?? '',
    notifyUrl: `${baseUrl}/api/paiement/notify`,
    returnUrl: `${baseUrl}/paiement/succes`,
    cancelUrl: `${baseUrl}/paiement/echec`,
  }
}

export async function initierPaiement(config: CinetPayConfig, payment: PaymentRequest): Promise<PaymentResponse> {
  const response = await fetch(`${CINETPAY_API_BASE}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency ?? 'XOF',
      description: payment.description,
      customer_name: payment.customerName,
      customer_email: payment.customerEmail,
      customer_phone: payment.customerPhone,
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      cancel_url: config.cancelUrl,
      metadata: payment.metadata,
    }),
  })
  const data = await response.json()
  if (data.code === '201') {
    return { success: true, message: data.message, paymentUrl: data.data.payment_url, transactionId: payment.transactionId }
  }
  return { success: false, message: data.message || "Erreur lors de l'initialisation du paiement" }
}

export async function verifierStatutPaiement(
  config: CinetPayConfig,
  transactionId: string
): Promise<{ success: boolean; statut?: string; message: string }> {
  const url = `${CINETPAY_API_BASE}/payment/check?apikey=${encodeURIComponent(config.apiKey)}&site_id=${encodeURIComponent(config.siteId)}&transaction_id=${encodeURIComponent(transactionId)}`
  const response = await fetch(url, { headers: { Authorization: `Bearer ${config.secretKey}` } })
  const data = await response.json()
  if (data.code === '200') return { success: true, statut: data.data.status, message: data.message }
  return { success: false, message: data.message }
}
