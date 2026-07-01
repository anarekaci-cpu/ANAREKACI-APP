import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function AdminAnnoncesPage() {
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

  const { data: annonces } = await supabase
    .from("annonces")
    .select("*")
    .order("cree_le", { ascending: false })

  async function creerAnnonce(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("annonces").insert({
      titre: formData.get("titre") as string,
      contenu: formData.get("contenu") as string,
      auteur_id: user.id,
      publie: formData.get("publie") === "on",
      publie_le: formData.get("publie") === "on" ? new Date().toISOString() : null,
    })
    revalidatePath("/admin/annonces")
  }

  async function togglePublier(annonceId: string, publie: boolean) {
    "use server"
    const supabase = await createClient()
    await supabase.from("annonces").update({
      publie: !publie,
      publie_le: !publie ? new Date().toISOString() : null,
    }).eq("id", annonceId)
    revalidatePath("/admin/annonces")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Gestion des annonces</h1>
        <a href="/admin" className="text-sm hover:underline">Retour admin</a>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouvelle annonce</h2>
          <form action={creerAnnonce} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input name="titre" type="text" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea name="contenu" required rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <input name="publie" type="checkbox" id="publie" className="rounded" />
              <label htmlFor="publie" className="text-sm text-gray-700">Publier immediatement</label>
            </div>
            <button type="submit"
              className="bg-gray-900 text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-gray-700 transition">
              Creer l annonce
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Annonces existantes</h2>
          <div className="space-y-3">
            {annonces?.length === 0 && (
              <p className="text-sm text-gray-400">Aucune annonce pour le moment.</p>
            )}
            {annonces?.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 border border-gray-100 rounded-xl p-4">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{a.titre}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.publie ? "Publie" : "Brouillon"}</p>
                </div>
                <form action={async () => { "use server"; await togglePublier(a.id, a.publie) }}>
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                    a.publie ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {a.publie ? "Depublier" : "Publier"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
