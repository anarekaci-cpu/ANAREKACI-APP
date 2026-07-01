"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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
