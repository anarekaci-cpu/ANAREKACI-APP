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

  // Vérifier le droit d'inscription
  const { data: droit } = await supabase
    .from('droits_inscription')
    .select('*')
    .eq('membre_id', membre.id)
    .single()

  // Si le droit n'est pas payé, rediriger vers la page de paiement
  if (!droit || droit.statut !== 'paye') {
    redirect('/droit-inscription')
  }

  // Permettre l'accès au dashboard même si le membre est en attente de validation (s'il a payé)
  // Le statut du membre sera affiché mais ne bloquera pas l'accès

  const estActif = membre.statut === 'actif'

  const badgeClasses = estActif
    ? 'inline-block mt-4 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full border bg-anareka-vert-pale text-anareka-vert-clair border-anareka-vert-clair/30'
    : 'inline-block mt-4 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full border bg-anareka-or-pale text-anareka-terre border-anareka-or/40'

  const badgeTexte = estActif ? '✓ Membre actif' : '⏳ En attente de validation'

  const carteClasses = 'group bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-vert shadow-anareka p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-anareka-hov hover:border-t-anareka-or'

  const iconeClasses = 'text-anareka-vert group-hover:text-anareka-or transition-colors duration-300 mb-3'

  const cartes = [
    {
      href: '/profil',
      titre: 'Mon Profil',
      sous: "Gérer mes informations",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      href: '/cotisations',
      titre: 'Cotisations',
      sous: "Gérer mes paiements mensuels",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      href: '/paiements',
      titre: 'Mes Paiements',
      sous: "Historique et reçus",
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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