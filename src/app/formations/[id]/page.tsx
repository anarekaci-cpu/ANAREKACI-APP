import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { changerStatut, reinitialiserMotDePasse } from "./actions"
import { estAdmin, getMembreParCompte } from "@/lib/membres"
import ExportButton from "@/components/ExportButton"
import PasswordResetBanner from "@/components/PasswordResetBanner"

export default async function AdminMembresPage({
  searchParams,
}: {
  searchParams: Promise<{ recherche?: string, passwordError?: string }>
}) {
  const { recherche, passwordError } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect("/dashboard")
  }

  // Lecture unique du cookie httpOnly posé par reinitialiserMotDePasse().
  // Le composant client PasswordResetBanner le fait détruire dès l'affichage.
  const jar = await cookies()
  const rawReset = jar.get("anareka_password_reset")?.value
  const passwordReset = rawReset
    ? (JSON.parse(rawReset) as { nom: string; motDePasse: string })
    : null

  let query = supabase
    .from("membres")
    .select("*")

  // Appliquer la recherche si fournie
  if (recherche) {
    const terme = recherche.trim()
    query = query.or(`nom.ilike.%${terme}%,prenoms.ilike.%${terme}%,nom_complet.ilike.%${terme}%,telephone.ilike.%${terme}%,numero_membre.ilike.%${terme}%`)
  }

  const { data: membres } = await query.order("cree_le", { ascending: false })

  const btnValider = "bg-anareka-vert text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-anareka-vert-clair transition-colors"
  const btnSuspendre = "bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-red-200 transition-colors"
  const btnResetPassword = "bg-anareka-or text-white text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-anareka hover:bg-anareka-or-clair transition-colors"

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
        {/* Notification de réinitialisation (cookie httpOnly, une seule fois) */}
        {passwordReset && (
          <PasswordResetBanner nom={passwordReset.nom} motDePasse={passwordReset.motDePasse} />
        )}

        {/* Barre de recherche */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4 mb-4">
          <form className="flex gap-3">
            <input
              type="text"
              name="recherche"
              placeholder="Rechercher par nom, téléphone ou numéro de membre..."
              defaultValue={recherche}
              className="flex-1 bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2 text-sm focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20"
            />
            <button
              type="submit"
              className="bg-anareka-vert text-white text-xs font-semibold uppercase tracking-wide px-6 py-2 rounded-anareka hover:bg-anareka-vert-clair transition-colors"
            >
              Rechercher
            </button>
            {recherche && (
              <a
                href="/admin/membres"
                className="text-xs font-semibold uppercase tracking-wide text-anareka-gris hover:text-anareka-vert transition-colors px-4 py-2"
              >
                Effacer
              </a>
            )}
          </form>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <div className="px-6 py-4 border-b border-anareka-bordure flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert">Liste des membres</h2>
            <ExportButton
              data={membres?.map(m => ({
                numero_membre: m.numero_membre,
                nom_complet: m.nom_complet,
                nom: m.nom,
                prenoms: m.prenoms,
                telephone: m.telephone,
                sexe: m.sexe,
                commune_quartier: m.commune_quartier,
                type_activite: m.type_activite,
                statut: m.statut,
                role: m.role,
                cree_le: m.cree_le,
              })) || []}
              filename="membres_anareka"
              label="Exporter Excel"
            />
          </div>
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
                      <form action={async () => { "use server"; await reinitialiserMotDePasse(m.id) }}>
                        <button className={btnResetPassword}>
                          Réinitialiser mot de passe
                        </button>
                      </form>
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