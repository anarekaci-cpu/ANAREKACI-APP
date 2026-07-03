import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
const submitCls = "bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-vert-clair transition-colors"

export default async function AdminAnnoncesPage() {
  const supabase = await createClient()
  const auth = await supabase.auth.getUser()
  const user = auth.data.user
  if (!user) redirect("/login")

  const prof = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = prof.data?.role
  if (role !== "admin") redirect("/dashboard")

  const res = await supabase.from("annonces").select("*").order("cree_le", { ascending: false })
  const annonces = res.data

  async function creerAnnonce(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const auth = await supabase.auth.getUser()
    const user = auth.data.user
    if (!user) return
    const estPublie = formData.get("publie") === "on"
    await supabase.from("annonces").insert({
      titre: formData.get("titre") as string,
      contenu: formData.get("contenu") as string,
      auteur_id: user.id,
      publie: estPublie,
      publie_le: estPublie ? new Date().toISOString() : null,
    })
    revalidatePath("/admin/annonces")
  }

  async function togglePublier(id: string, publie: boolean) {
    "use server"
    const supabase = await createClient()
    await supabase.from("annonces").update({
      publie: !publie,
      publie_le: !publie ? new Date().toISOString() : null,
    }).eq("id", id)
    revalidatePath("/admin/annonces")
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des annonces</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or">Retour admin</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvelle annonce</h2>
          <form action={creerAnnonce} className="space-y-4">
            <div>
              <label className={labelCls}>Titre</label>
              <input name="titre" type="text" required className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Contenu</label>
              <textarea name="contenu" required rows={4} className={champCls} />
            </div>
            <div className="flex items-center gap-2">
              <input name="publie" type="checkbox" id="publie" className="rounded accent-anareka-vert" />
              <label htmlFor="publie" className="text-sm text-anareka-noir">Publier immediatement</label>
            </div>
            <button type="submit" className={submitCls}>Creer l&apos;annonce</button>
          </form>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Annonces existantes</h2>
          <div className="space-y-3">
            {annonces?.length === 0 && (
              <p className="text-sm text-anareka-gris">Aucune annonce pour le moment.</p>
            )}
            {annonces?.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 border border-anareka-bordure rounded-anareka p-4">
                <div>
                  <p className="font-semibold text-anareka-noir text-sm">{a.titre}</p>
                  <p className="text-xs text-anareka-gris mt-1">{a.publie ? "Publie" : "Brouillon"}</p>
                </div>
                <form action={togglePublier.bind(null, a.id, a.publie)}>
                  <button className={a.publie ? "text-xs font-semibold uppercase px-3 py-1.5 rounded-anareka bg-red-100 text-red-700 hover:bg-red-200" : "text-xs font-semibold uppercase px-3 py-1.5 rounded-anareka bg-anareka-vert-pale text-anareka-vert-clair hover:bg-anareka-vert hover:text-white"}>
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