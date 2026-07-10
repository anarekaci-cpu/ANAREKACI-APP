"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

function genererMotDePasseTemporaire(): string {
  // 12 caractères alphanumériques, cryptographiquement aléatoires
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const octets = crypto.randomBytes(12)
  let motDePasse = ""
  for (let i = 0; i < 12; i++) {
    motDePasse += alphabet[octets[i] % alphabet.length]
  }
  return motDePasse
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") return null
  return supabase
}

export async function changerStatut(membreId: string, statut: "actif" | "suspendu" | "en_attente") {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { error } = await supabase
    .from("profiles")
    .update({ statut })
    .eq("id", membreId)

  if (error) return { error: error.message }

  revalidatePath("/admin/membres")
  return { success: true }
}

export async function changerRole(membreId: string, role: "membre" | "tresorier" | "admin") {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", membreId)

  if (error) return { error: error.message }

  revalidatePath("/admin/membres")
  return { success: true }
}

export async function resetPassword(membreId: string) {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", membreId)
    .single()

  if (!profile) return { error: "Membre non trouvé" }

  const nouveauMotDePasse = genererMotDePasseTemporaire()

  const { error } = await supabase.auth.admin.updateUserById(membreId, {
    password: nouveauMotDePasse
  })

  if (error) return { error: error.message }

  await supabase
    .from("notifications")
    .insert({
      membre_id: membreId,
      titre: "Mot de passe réinitialisé",
      message: `Votre mot de passe a été réinitialisé par un administrateur. Votre nouveau mot de passe temporaire est : ${nouveauMotDePasse}. Veuillez le changer dès votre prochaine connexion.`,
      type: "warning",
    })

  revalidatePath("/admin/membres")
  return { success: true }
}

export async function validerDroitInscription(membreId: string) {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { data: admin } = await supabase.auth.getUser()
  if (!admin.user) return { error: "Non autorise" }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      droit_inscription_paye: true,
      droit_inscription_montant: 10000,
      droit_inscription_date_paiement: new Date().toISOString().split('T')[0],
      droit_inscription_validation_par: admin.user.id,
      droit_inscription_validation_date: new Date().toISOString().split('T')[0],
      droit_inscription_validation_statut: 'paye',
      statut: 'actif',
    })
    .eq("id", membreId)

  if (profileError) return { error: profileError.message }

  await supabase
    .from("notifications")
    .insert({
      membre_id: membreId,
      titre: "Droit d'inscription validé",
      message: "Votre déclaration de paiement du droit d'inscription a été validée par un administrateur. Vous pouvez maintenant utiliser toutes les fonctionnalités de l'application.",
      type: "success",
    })

  revalidatePath("/admin/membres")
  return { success: true }
}

export async function refuserDroitInscription(membreId: string) {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      droit_inscription_validation_statut: 'refuse',
      droit_inscription_validation_demande: false,
    })
    .eq("id", membreId)

  if (profileError) return { error: profileError.message }

  await supabase
    .from("notifications")
    .insert({
      membre_id: membreId,
      titre: "Déclaration de paiement refusée",
      message: "Votre déclaration de paiement du droit d'inscription n'a pas pu être confirmée. Veuillez régler votre droit d'inscription directement dans l'application.",
      type: "error",
    })

  revalidatePath("/admin/membres")
  return { success: true }
}