import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const estActif = profile?.statut === 'actif'

  const cartes = [
    {
      href: '/cotisations',
      titre: 'Cotisations',
      sous: "Payer ou voir l'historique",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      href: '/annonces',
      titre: 'Annonces',
      sous: "Actualités de l'association",
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
      sous: "S'inscrire et télécharger",
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
      {/* Carte bienvenue */}
      <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8 mb-6">
        <p className="text-sm text-anareka-gris">Bienvenue,</p>
        <h2 className="font-serif text-3xl font-bold text-anareka-vert mt-1">
          {profile?.nom_complet}
        </h2>
        <p className="text-sm text-anareka-gris mt-2">
          Identifiant : <span className="font-mono text-anareka-noir">{profile?.identifiant}</span>
        </p>
        <span
          className={`inline-block mt-4 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full border ${
            estActif
              ? 'bg-anareka-vert-pale text-anareka-vert-clair border-anareka-vert-clair/30'
              : 'bg-anareka-or-pale text-anareka-terre border-anareka-or/40'
          }`}
        >
          {estActif ? '✓ Membre actif' : '⏳ En attente de validation'}
        </span>
      </div>

      {/* Cartes de navigation */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cartes.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-vert shadow-anareka p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-anareka-hov hover:border-t-anareka-or"
          >
            <div className="text-anareka-vert group-hover:text-anareka-or transition-colors duration-300 mb-3">
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