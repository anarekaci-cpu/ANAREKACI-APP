"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import { estAdmin } from "@/lib/membres"

const COOKIE_NAME = "anareka_password_reset"

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
    password: nouveauMotDePasse,
  })

  if (error) return { error: error.message }

  // Le mot de passe ne transite plus jamais par l'URL (donc plus dans l'historique
  // du navigateur, les logs serveur/proxy, ni les en-têtes Referer).
  // On le pose dans un cookie httpOnly, lu une seule fois côté serveur puis détruit
  // dès l'affichage (voir effacerNotificationMotDePasse ci-dessous).
  const jar = await cookies()
  jar.set(
    COOKIE_NAME,
    JSON.stringify({ nom: membre.nom_complet, motDePasse: nouveauMotDePasse }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/admin/membres",
      maxAge: 60, // filet de sécurité si jamais l'effacement automatique échoue
    }
  )

  revalidatePath("/admin/membres")
  redirect("/admin/membres")
}

export async function effacerNotificationMotDePasse() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}