import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const auth = await supabase.auth.getUser()
  const user = auth.data.user
  if (!user) redirect('/login')

  const membreQuery = await supabase
    .from('membres')
    .select('*')
    .eq('compte_id', user.id)
    .maybeSingle()
  const membre = membreQuery.data

  // Si pas de fiche, rediriger vers l'attente
  if (!membre) {
    redirect('/attente-validation')
  }

  const estActif = membre.statut === 'actif'

  const badgeClasses = estActif
    ? 'inline-block mt-4 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full border bg-anareka-vert-pale text-anareka-vert-clair border-anareka-vert-clair/30'
    : 'inline-block mt-4 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full border bg-anareka-or-pale text-anareka-terre border-anareka-or/40'

  const badgeTexte = estActif ? '✓ Membre actif' : '⏳ En attente de validation'

  const carteClasses = 'group bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-vert shadow-anareka p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-anareka-hov hover:border-t-anareka-or'

  const iconeClasses = 'text-anareka-vert group-hover:text-anareka-or transition-colors duration-300 mb-3'

  const cartes = [
    {
      href: '/annonces',
      titre: 'Annonces',
      sous: "Actualités de l&apos;association",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      ),
    },
    {
      href: '/formations',
      titre: 'Formations',
      sous: "S&apos;inscrire et télécharger",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
      <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8 mb-6">
        <p className="text-sm text-anareka-gris">Bienvenue,</p>
        <h2 className="font-serif text-3xl font-bold text-anareka-vert mt-1">
          {membre.nom_complet}
        </h2>
        <p className="text-sm text-anareka-gris mt-2">
          Téléphone : <span className="font-mono text-anareka-noir">{membre.telephone}</span>
        </p>
        <span className={badgeClasses}>
          {badgeTexte}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cartes.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={carteClasses}
          >
            <div className={iconeClasses}>
              {c.icone}
            </div>
            <div className="font-semibold text-anareka-vert text-sm">{c.titre}</div>
            <div className="text-xs text-anareka-gris mt-1">{c.sous}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}