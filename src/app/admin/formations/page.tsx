import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"
const submitCls = "bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-vert-clair transition-colors"

export default async function AdminFormationsPage() {
  const supabase = await createClient()
  const auth = await supabase.auth.getUser()
  const user = auth.data.user
  if (!user) redirect("/login")

  const prof = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = prof.data?.role
  if (role !== "admin" && role !== "tresorier") redirect("/dashboard")

  const res = await supabase.from("formations").select("*").order("cree_le", { ascending: false })
  const formations = res.data

  async function creerFormation(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const cap = formData.get("capacite")
    await supabase.from("formations").insert({
      titre: formData.get("titre") as string,
      description: formData.get("description") as string,
      lieu: formData.get("lieu") as string,
      date_debut: formData.get("date_debut") || null,
      capacite: cap ? Number(cap) : null,
      ouvert_inscription: true,
    })
    revalidatePath("/admin/formations")
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des formations</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or">Retour admin</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Nouvelle formation</h2>
          <form action={creerFormation} className="space-y-4">
            <div>
              <label className={labelCls}>Titre</label>
              <input name="titre" type="text" required className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea name="description" rows={3} className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Lieu</label>
              <input name="lieu" type="text" className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Date de debut</label>
              <input name="date_debut" type="datetime-local" className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Capacite (optionnel)</label>
              <input name="capacite" type="number" min="1" className={champCls} />
            </div>
            <button type="submit" className={submitCls}>Creer la formation</button>
          </form>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
          <h2 className="font-serif text-xl font-bold text-anareka-vert mb-4">Formations existantes</h2>
          <div className="space-y-3">
            {formations?.length === 0 && (
              <p className="text-sm text-anareka-gris">Aucune formation pour le moment.</p>
            )}
            {formations?.map((f) => (
              <div key={f.id} className="border border-anareka-bordure rounded-anareka p-4">
                <p className="font-semibold text-anareka-noir text-sm">{f.titre}</p>
                <p className="text-xs text-anareka-gris mt-1">{f.lieu ?? "Lieu non defini"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}