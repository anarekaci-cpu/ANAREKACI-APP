import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { estAdmin, getMembreParCompte } from '@/lib/membres'

async function changerRoleMembre(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: adminProfile } = await supabase
    .from('membres')
    .select('role')
    .eq('compte_id', user.id)
    .single()

  if (!adminProfile || !estAdmin(adminProfile.role)) {
    return redirect('/dashboard')
  }

  const membreId = formData.get('membreId') as string
  const nouveauRole = formData.get('nouveauRole') as string

  const { error } = await supabase
    .from('membres')
    .update({ role: nouveauRole })
    .eq('id', membreId)

  if (error) {
    return redirect('/admin/roles?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/roles')
  revalidatePath('/admin/membres')
  redirect('/admin/roles?success=Rôle+mis+à+jour+avec+succès')
}

export default async function AdminRolesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const { data: membres } = await supabase
    .from('membres')
    .select('*')
    .order('nom_complet', { ascending: true })

  const roles = ['membre', 'tresorier', 'secretaire', 'bureau', 'admin']

  const roleLabels: Record<string, string> = {
    membre: 'Membre',
    tresorier: 'Trésorier',
    secretaire: 'Secrétaire',
    bureau: 'Membre du bureau',
    admin: 'Administrateur'
  }

  const roleColors: Record<string, string> = {
    membre: 'bg-anareka-vert-pale text-anareka-vert-clair',
    tresorier: 'bg-blue-100 text-blue-700',
    secretaire: 'bg-purple-100 text-purple-700',
    bureau: 'bg-anareka-or-pale text-anareka-terre',
    admin: 'bg-red-100 text-red-700'
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Gestion des rôles</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
        {/* Légende des rôles */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4 mb-6">
          <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">Description des rôles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${roleColors.membre.split(' ')[0]}`} />
              <span><strong>Membre :</strong> Accès membre standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${roleColors.tresorier.split(' ')[0]}`} />
              <span><strong>Trésorier :</strong> Gestion financière</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${roleColors.secretaire.split(' ')[0]}`} />
              <span><strong>Secrétaire :</strong> Gestion administrative</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${roleColors.bureau.split(' ')[0]}`} />
              <span><strong>Bureau :</strong> Droits étendus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${roleColors.admin.split(' ')[0]}`} />
              <span><strong>Admin :</strong> Accès total</span>
            </div>
          </div>
        </div>

        {/* Tableau des membres */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-anareka-vert-pale text-anareka-vert text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Membre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">N° Membre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Rôle actuel</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Nouveau rôle</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-anareka-bordure">
              {membres?.map((m) => (
                <tr key={m.id} className="hover:bg-anareka-ivoire transition-colors">
                  <td className="px-4 py-3 font-medium text-anareka-noir">
                    {m.nom_complet}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-anareka-noir/70">
                    {m.numero_membre}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[m.role]}`}>
                      {roleLabels[m.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={changerRoleMembre}>
                      <input type="hidden" name="membreId" value={m.id} />
                      <select
                        name="nouveauRole"
                        className="border border-anareka-bordure rounded-anareka px-3 py-1.5 text-xs focus:outline-none focus:border-anareka-or"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role} selected={role === m.role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={changerRoleMembre}>
                      <input type="hidden" name="membreId" value={m.id} />
                      <input type="hidden" name="nouveauRole" value={m.role} />
                      <button
                        type="submit"
                        className="text-xs font-semibold uppercase tracking-wide bg-anareka-vert text-white px-3 py-1.5 rounded-anareka hover:bg-anareka-vert-clair transition-colors"
                      >
                        Mettre à jour
                      </button>
                    </form>
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
