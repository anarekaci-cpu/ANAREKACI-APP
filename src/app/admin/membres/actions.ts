"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import { estAdmin } from "@/lib/membres"

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

  const { data: membre } = await supabase
    .from("membres")
    .select("role")
    .eq("compte_id", user.id)
    .single()

  if (!membre || !estAdmin(membre.role)) return null
  return supabase
}

export async function changerStatut(membreId: string, statut: "actif" | "suspendu" | "en_attente") {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { error } = await supabase
    .from("membres")
    .update({ statut })
    .eq("id", membreId)

  if (error) return { error: error.message }

  revalidatePath("/admin/membres")
  return { success: true }
}

export async function reinitialiserMotDePasse(membreId: string) {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { data: membre } = await supabase
    .from("membres")
    .select("compte_id, nom_complet")
    .eq("id", membreId)
    .single()

  if (!membre) return { error: "Membre non trouvé" }

  const nouveauMotDePasse = genererMotDePasseTemporaire()

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(membre.compte_id, {
    password: nouveauMotDePasse
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/membres")
  redirect(`/admin/membres?passwordReset=${encodeURIComponent(`${membre.nom_complet}: ${nouveauMotDePasse}`)}`)
}