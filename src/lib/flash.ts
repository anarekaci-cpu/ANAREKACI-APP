import { redirect } from 'next/navigation'

/** Paramètres d'URL transportant un message après une server action. */
export type FlashParams = Promise<{ erreur?: string; succes?: string }>

/**
 * Redirige vers `chemin` en y joignant un message (?erreur=… ou ?succes=…).
 * `URLSearchParams` gère l'encodage ; la page lit la valeur DÉJÀ décodée
 * (l'ancien code appelait decodeURIComponent une 2ᵉ fois, ce qui plantait
 * dès qu'un message contenait un « % »).
 */
export function aller(chemin: string, flash: { erreur?: string; succes?: string } = {}): never {
  const [base, existant] = chemin.split('?')
  const params = new URLSearchParams(existant ?? '')
  if (flash.erreur) params.set('erreur', flash.erreur)
  if (flash.succes) params.set('succes', flash.succes)
  const qs = params.toString()
  redirect(qs ? `${base}?${qs}` : base)
}
