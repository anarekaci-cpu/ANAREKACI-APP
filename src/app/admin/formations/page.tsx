import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function AdminFormationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "tresorier")) {
    redirect("/dashboard")
  }

  const { data: formations } = await supabase
    .from("formations")
    .select("*")
    .order("cree_le", { ascending: false })

  async function creerFormation(formData: FormData) {
    "use server"
    const supabase = await createClient()
    await supabase.from("formations").insert({
      titre: formData.get("titre") as string,
      description: formData.get("description") as string,
      lieu: formData.get("lieu") as string,
      date_debut: formData.get("date_debut") || null,
      capacite: formData.get("capacite") ? Number(formData.get("capacite")) : null,
      ouvert_inscription: true,
    })
    revalidatePath("/admin/formations")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Gestion des formations</h1>
        <a href="/admin" className="text-sm hover:underline">Retour admin</a>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouvelle formation</h2>
          <form action={creerFormation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input name="titre" type="text" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input name="lieu" type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de debut</label>
              <input name="date_debut" type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacite (optionnel)</label>
              <input name="capacite" type="number" min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <button type="submit"
              className="bg-gray-900 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-gray-700 transition">
              Creer la formation
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Formations existantes</h2>
          <div className="space-y-3">
            {formations?.length === 0 && (
              <p className="text-sm text-gray-400">Aucune formation pour le moment.</p>
            )}
            {formations?.map((f) => (
              <div key={f.id} className="border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800 text-sm">{f.titre}</p>
                <p className="text-xs text-gray-400 mt-1">{f.lieu ?? "Lieu non defini"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
