// lib/cinetpay.ts
// Fonctions pour interagir avec l'API CinetPay

const CINETPAY_API_BASE = 'https://api.cinetpay.com/v1';

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  secretKey: string;
  notifyUrl: string; // URL de notification IPN
  returnUrl: string; // URL de retour après paiement
  cancelUrl: string; // URL si annulation (optionnelle)
}

export interface PaymentRequest {
  transactionId: string; // ID unique de la transaction (généré par l'app)
  amount: number; // Montant en FCFA
  currency?: string; // Par défaut 'XOF'
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  description: string;
  metadata?: Record<string, any>; // infos supplémentaires (ex: membre_id)
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentUrl?: string; // URL vers la page de paiement CinetPay
  transactionId?: string;
}

export function createCinetPayConfig(baseUrl: string): CinetPayConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY!,
    siteId: process.env.CINETPAY_SITE_ID!,
    secretKey: process.env.CINETPAY_SECRET_KEY!,
    notifyUrl: `${baseUrl}/api/paiement/notify`,
    returnUrl: `${baseUrl}/paiement/succes`,
    cancelUrl: `${baseUrl}/paiement/echec`,
  };
}

export async function initierPaiement(
  config: CinetPayConfig,
  payment: PaymentRequest
): Promise<PaymentResponse> {
  const payload = {
    apikey: config.apiKey,
    site_id: config.siteId,
    transaction_id: payment.transactionId,
    amount: payment.amount,
    currency: payment.currency || 'XOF',
    description: payment.description,
    customer_name: payment.customerName,
    customer_email: payment.customerEmail,
    customer_phone: payment.customerPhone,
    notify_url: config.notifyUrl,
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    metadata: payment.metadata,
  };

  const response = await fetch(`${CINETPAY_API_BASE}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.code === '201') {
    return {
      success: true,
      message: data.message,
      paymentUrl: data.data.payment_url,
      transactionId: payment.transactionId,
    };
  } else {
    return {
      success: false,
      message: data.message || 'Erreur lors de l’initialisation du paiement',
    };
  }
}

export async function verifierStatutPaiement(
  config: CinetPayConfig,
  transactionId: string
): Promise<{ success: boolean; statut?: string; message: string }> {
  const response = await fetch(
    `${CINETPAY_API_BASE}/payment/check?apikey=${config.apiKey}&site_id=${config.siteId}&transaction_id=${transactionId}`,
    { headers: { Authorization: `Bearer ${config.secretKey}` } }
  );
  const data = await response.json();

  if (data.code === '200') {
    return { success: true, statut: data.data.status, message: data.message };
  }
  return { success: false, message: data.message };
}