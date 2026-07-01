import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { changerStatut, changerRole } from "./actions"

export default async function AdminMembresPage() {
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

  const { data: membres } = await supabase
    .from("profiles")
    .select("*")
    .order("cree_le", { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Gestion des membres</h1>
        <a href="/admin" className="text-sm hover:underline">Retour admin</a>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Identifiant</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membres?.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.nom_complet}</td>
                  <td className="px-4 py-3 font-mono text-xs">{m.identifiant}</td>
                  <td className="px-4 py-3">{m.telephone ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      m.statut === "actif" ? "bg-green-100 text-green-700" :
                      m.statut === "suspendu" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {m.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{m.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {m.statut !== "actif" && (
                        <form action={async () => { "use server"; await changerStatut(m.id, "actif") }}>
                          <button className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-700">
                            Valider
                          </button>
                        </form>
                      )}
                      {m.statut !== "suspendu" && (
                        <form action={async () => { "use server"; await changerStatut(m.id, "suspendu") }}>
                          <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">
                            Suspendre
                          </button>
                        </form>
                      )}
                      {m.role !== "admin" && (
                        <form action={async () => { "use server"; await changerRole(m.id, "admin") }}>
                          <button className="bg-gray-700 text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800">
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
