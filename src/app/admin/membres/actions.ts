"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { estAdmin, getMembreParCompte } from "@/lib/membres"

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membre } = await getMembreParCompte(supabase, user.id)
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

export async function changerRole(membreId: string, role: "membre" | "bureau" | "admin") {
  const supabase = await checkAdmin()
  if (!supabase) return { error: "Non autorise" }

  const { error } = await supabase
    .from("membres")
    .update({ role })
    .eq("id", membreId)

  if (error) return { error: error.message }

  revalidatePath("/admin/membres")
  return { success: true }
}
