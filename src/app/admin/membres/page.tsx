import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { changerStatut, changerRole } from "./actions"
import { estAdmin, getMembreParCompte } from "@/lib/membres"

export default async function AdminMembresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect("/dashboard")
  }

  const { data: membres } = await supabase
    .from("membres")
    .select("*")
    .order("cree_le", { ascending: false })

  const btnValider = "bg-anareka-vert text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-anareka-vert-clair transition-colors"
  const btnSuspendre = "bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-red-200 transition-colors"
  const btnRetirerAdmin = "bg-anareka-gris-clair text-anareka-noir text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-anareka-bordure transition-colors"
  const btnRendreAdmin = "bg-anareka-noir text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-anareka-vert-med transition-colors"

  const statutCls = (statut: string) => {
    if (statut === "actif") return "px-2.5 py-1 rounded-full text-xs font-semibold bg-anareka-vert-pale text-anareka-vert-clair"
    if (statut === "suspendu") return "px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
    return "px-2.5 py-1 rounded-full text-xs font-semibold bg-anareka-or-pale text-anareka-terre"
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des membres</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-anareka-vert-pale text-anareka-vert text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Nom</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">N° Membre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Téléphone</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Commune</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-anareka-bordure">
              {membres?.map((m) => (
                <tr key={m.id} className="hover:bg-anareka-ivoire transition-colors">
                  <td className="px-4 py-3 font-medium text-anareka-noir">
                    <div className="flex items-center gap-2">
                      {m.nom_complet}
                      {m.role === "admin" && (
                        <span className="bg-anareka-or-pale text-anareka-terre text-xs font-semibold px-2 py-0.5 rounded-full border border-anareka-or/40">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-anareka-noir/70">{m.numero_membre ?? "-"}</td>
                  <td className="px-4 py-3 text-anareka-noir/80">{m.telephone ?? "-"}</td>
                  <td className="px-4 py-3 text-anareka-noir/80">{m.commune_quartier ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={statutCls(m.statut)}>
                      {m.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {m.statut !== "actif" && (
                        <form action={async () => { "use server"; await changerStatut(m.id, "actif") }}>
                          <button className={btnValider}>
                            Valider
                          </button>
                        </form>
                      )}
                      {m.statut !== "suspendu" && (
                        <form action={async () => { "use server"; await changerStatut(m.id, "suspendu") }}>
                          <button className={btnSuspendre}>
                            Suspendre
                          </button>
                        </form>
                      )}
                      {m.role === "admin" ? (
                        <form action={async () => { "use server"; await changerRole(m.id, "membre") }}>
                          <button className={btnRetirerAdmin}>
                            Retirer admin
                          </button>
                        </form>
                      ) : (
                        <form action={async () => { "use server"; await changerRole(m.id, "admin") }}>
                          <button className={btnRendreAdmin}>
                            Rendre admin
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}