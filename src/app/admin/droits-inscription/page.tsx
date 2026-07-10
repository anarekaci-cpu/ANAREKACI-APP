import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { estAdmin, getMembreParCompte } from '@/lib/membres'
import { validerDroitInscription, refuserDroitInscription } from './actions'

export default async function AdminDroitsInscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monProfil } = await getMembreParCompte(supabase, user.id)
  if (!monProfil || !estAdmin(monProfil.role)) {
    redirect('/dashboard')
  }

  const { data: droits } = await supabase
    .from('droits_inscription')
    .select(`
      *,
      membre:membres (
        id,
        nom,
        prenoms,
        nom_complet,
        telephone,
        numero_membre
      )
    `)
    .in('statut', ['en_attente_validation', 'refuse'])
    .order('cree_le', { ascending: false })

  const statutCls = (statut: string) => {
    if (statut === 'en_attente_validation') return 'px-2.5 py-1 rounded-full text-xs font-semibold bg-anareka-or-pale text-anareka-terre'
    if (statut === 'refuse') return 'px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'
    return 'px-2.5 py-1 rounded-full text-xs font-semibold bg-anareka-vert-pale text-anareka-vert-clair'
  }

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">Validation des droits d&apos;inscription</h1>
          <a href="/admin" className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or transition-colors">Retour admin</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
        {!droits || droits.length === 0 ? (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-12 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="font-serif text-xl font-semibold text-anareka-vert mb-2">Aucune demande en attente</h2>
            <p className="text-anareka-gris">Tous les droits d&apos;inscription sont à jour.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {droits?.map((droit: any) => (
              <div key={droit.id} className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-anareka-noir">{droit.membre.nom_complet}</h3>
                      <span className={statutCls(droit.statut)}>
                        {droit.statut === 'en_attente_validation' ? 'En attente' : 'Refusé'}
                      </span>
                    </div>
                    <div className="text-sm text-anareka-gris space-y-1">
                      <p>N° Membre: <span className="font-mono">{droit.membre.numero_membre}</span></p>
                      <p>Téléphone: {droit.membre.telephone}</p>
                      <p>Montant: <span className="font-semibold">{droit.montant.toLocaleString('fr-FR')} FCFA</span></p>
                      <p>Demande le: {new Date(droit.cree_le).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                {droit.statut === 'en_attente_validation' ? (
                  <div className="flex gap-3">
                    <form action={async () => { 'use server'; await validerDroitInscription(droit.id, droit.membre.id) }}>
                      <button className="bg-anareka-vert text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-anareka hover:bg-anareka-vert-clair transition-colors">
                        Valider le paiement
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await refuserDroitInscription(droit.id) }}>
                      <button className="bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-anareka hover:bg-red-200 transition-colors">
                        Refuser
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-anareka p-3">
                    <p className="text-sm text-red-700">
                      <strong>Motif de refus:</strong> {droit.motif_refus || 'Non spécifié'}
                    </p>
                    <form action={async () => { 'use server'; await validerDroitInscription(droit.id, droit.membre.id) }} className="mt-2">
                      <button className="text-xs text-anareka-vert hover:text-anareka-or transition-colors underline">
                        Réactiver cette demande
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
